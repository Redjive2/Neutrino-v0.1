const EMOJIS = [
  '😀','😂','😍','🥳','😎','🤔','😢','😡','👍','👎','❤️','🔥','🎉','💯','✨','🚀',
  '👀','🙌','🤝','💪','🧠','💡','⚡','🌟','🎮','🎵','☕','🍕','🌈','🦄','👻','🤖'
];


function enc(s) { return encodeURIComponent(s); }

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function tokenToHex(token) {
  return token.map(b => b.toString(16).padStart(2, '0')).join('');
}


// --- Session ---

let session = null;

function loadSession() {
  try {
    const s = sessionStorage.getItem('neutrino-session');
    if (s) session = JSON.parse(s);
  } catch {
    session = null;
    sessionStorage.removeItem('neutrino-session');
  }
}

function saveSession() {
  sessionStorage.setItem('neutrino-session', JSON.stringify(session));
}

function clearSession() {
  session = null;
  sessionStorage.removeItem('neutrino-session');
}

function authBody(extra = {}) {
  return { username: session.username, token: session.token, ...extra };
}


// --- API client ---
//
// All authenticated calls are serialized through apiQueue because the
// server rotates the token on every response.

let apiQueue = Promise.resolve();

function apiPost(path, body) {
  const job = apiQueue.then(() => _apiPost(path, body));
  apiQueue = job.catch(() => {});
  return job;
}

async function _apiPost(path, body) {
  try {
    if (session && body && body.username === session.username && 'token' in body) {
      body.token = session.token;
    }

    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (data.carriesToken && session) {
      session.token = data.newToken;
      saveSession();
    }

    if ((res.status === 404 || res.status === 401) && session && body && body.username === session.username) {
      const msg = (data && data.message) || '';
      if (msg.includes('Could not find user') || msg.includes('not in an active session') ||
          msg.includes('Invalid token') || msg.includes('Session timed out')) {
        clearSession();
        location.reload();
        return { ok: false, status: res.status, data };
      }
    }

    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: null };
  }
}

function apiUpload(file) {
  const job = apiQueue.then(() => _apiUpload(file));
  apiQueue = job.catch(() => {});
  return job;
}

async function _apiUpload(file) {
  try {
    const form = new FormData();
    form.append('username', session.username);
    form.append('token', tokenToHex(session.token));
    form.append('file', file);

    const res = await fetch('/media/upload', { method: 'POST', body: form });
    const data = await res.json();

    if (data.carriesToken && session) {
      session.token = data.newToken;
      saveSession();
    }

    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: null };
  }
}

// Token-free; does not rotate.
async function checkSessionAlive() {
  if (!session) return false;

  try {
    const res = await fetch('/get/sessionstatus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: session.username }),
    });

    if (!res.ok) return false;
    const data = await res.json();

    if (data && data.data) {
      const pic = data.data.profilePic || null;
      if (pic !== (session.profilePic || null)) {
        session.profilePic = pic;
        saveSession();
        profilePicCache.set(session.username, pic);
        updateUserUI();
      }
      return !!data.data.active;
    }

    return false;
  } catch {
    return true;
  }
}


// --- Caches ---

const profilePicCache = new Map();
const serverThumbnailCache = new Map();

async function ensureProfilePics(usernames) {
  const toFetch = [...new Set(usernames)].filter(u => !profilePicCache.has(u));
  if (toFetch.length === 0) return;

  await Promise.all(toFetch.map(async u => {
    profilePicCache.set(u, null);
    try {
      const res = await fetch('/get/sessionstatus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u }),
      });
      if (res.ok) {
        const data = await res.json();
        profilePicCache.set(u, (data.data && data.data.profilePic) || null);
      }
    } catch {}
  }));
}


// --- Navigation state ---

let currentServer        = null;
let currentServerName    = null;
let currentServerOwner   = null;
let currentServerPublic  = true;
let currentServerMembers = [];
let currentCategory      = null;
let currentChannel       = null;
let currentChannelMembers = [];

let lastServerStructure = null;
let lastSeenId          = -1;
let navGeneration       = 0;

let renderedMessages = [];
let hasMoreMessages  = false;
let loadingMore      = false;

let pendingAttachments = [];
let userServerOrder    = [];

const collapsedCategories = new Set();
const lastReadIds         = new Map();

let pollTimer         = null;
let sessionCheckTimer = null;
let exploreOpen       = false;


// --- Data fetching ---

async function fetchManifest() {
  const { ok, data } = await apiPost('/get/manifest', authBody());
  if (!ok) return { servers: [], serverOrder: [] };

  const d = data.data || {};
  return { servers: d.servers || [], serverOrder: d.serverOrder || [] };
}

async function fetchServerData(serverId) {
  const { ok, data } = await apiPost(`/get/server/${enc(serverId)}`, authBody());
  return ok ? data.data : null;
}

async function fetchChannelData(server, category, channel, before = 0) {
  const { ok, data } = await apiPost(
    `/get/channel/${enc(server)}/${enc(category)}/${enc(channel)}`,
    authBody({ before })
  );
  return ok ? data.data : null;
}

async function fetchNewMessages(server, category, channel, sinceId) {
  const { ok, data } = await apiPost(
    `/get/chat/${enc(server)}/${enc(category)}/${enc(channel)}/${sinceId}`,
    authBody()
  );
  return ok ? (data.data || []) : null;
}

function applyServerOrder(servers) {
  const orderMap = new Map(userServerOrder.map((id, i) => [id, i]));

  return [...servers].sort((a, b) => {
    const ai = orderMap.has(a.id) ? orderMap.get(a.id) : Infinity;
    const bi = orderMap.has(b.id) ? orderMap.get(b.id) : Infinity;
    if (ai !== bi) return ai - bi;
    return a.name.localeCompare(b.name);
  });
}

async function fetchMyServers(manifestData) {
  const { servers, serverOrder } = manifestData || await fetchManifest();
  userServerOrder = serverOrder;

  const mine = [];
  for (const s of servers) {
    const sd = await fetchServerData(s.id);
    if (sd && sd.members && sd.members.includes(session.username)) {
      mine.push(s);
    }
  }

  return applyServerOrder(mine);
}

async function saveServerOrder(order) {
  await apiPost('/edit/serverorder', authBody({ order }));
}


// --- Auth ---

async function login(username, password) {
  const res = await fetch(`/open/session/${encodeURIComponent(username)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });

  if (!res.ok) return false;

  const data = await res.json();
  session = { username, token: data.newToken };
  saveSession();
  return true;
}

async function register(username, password) {
  const res = await fetch(`/new/user/${encodeURIComponent(username)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  return res.ok;
}

async function logout() {
  stopPolling();
  stopSessionCheck();
  if (session) await apiPost('/close/session', authBody());
  clearSession();
  location.reload();
}


// --- Text formatting ---

function formatTime() {
  const now = new Date();
  let h = now.getHours();
  const m = now.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

function formatText(raw) {
  let t = raw.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/\*(.+?)\*/g, '<em>$1</em>');
  t = t.replace(/`(.+?)`/g, '<code style="background:rgba(0,0,0,.3);padding:2px 4px;border-radius:3px;font-size:13px">$1</code>');
  return t;
}


// --- HTML builders ---

const DELETE_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>';

const EDIT_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';

const VIDEO_ICON = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>';

function avatarHTML(name, picId) {
  const inner = picId
    ? `<img src="/media/${picId}" alt="${esc(name)}">`
    : esc(name[0]).toUpperCase();
  const bg = picId ? 'transparent' : 'var(--brand-color)';
  return { inner, bg };
}

function buildAttachmentsHTML(attachments) {
  if (!attachments || attachments.length === 0) return '';

  const items = attachments.map(a => {
    if (a.mimeType && a.mimeType.startsWith('image/')) {
      return `<img class="message-img" src="/media/${a.id}" alt="image" loading="lazy" onclick="window.open('/media/${a.id}','_blank')">`;
    }
    if (a.mimeType && a.mimeType.startsWith('video/')) {
      return `<video class="message-video" src="/media/${a.id}" controls></video>`;
    }
    return '';
  }).filter(Boolean).join('');

  return items ? `<div class="message-attachments">${items}</div>` : '';
}

function buildMessageHTML(msgs) {
  return msgs.map((msg, i) => {
    const prev = i > 0 ? msgs[i - 1] : null;
    const isGroupStart = !prev || prev.from !== msg.from;
    const { inner, bg } = avatarHTML(msg.from, profilePicCache.get(msg.from));
    const canDelete = session && (msg.from === session.username || currentServerOwner === session.username);
    const canEdit   = session && msg.from === session.username;

    return `
      <div class="message ${isGroupStart ? 'message-group-start' : ''}" data-msg-id="${msg.id}">
        <div class="message-avatar ${isGroupStart ? '' : 'hidden'}" style="background:${bg}">
          ${inner}
        </div>
        <div class="message-content">
          ${isGroupStart ? `
            <div class="message-header">
              <span class="message-author">${esc(msg.from)}</span>
              <span class="message-timestamp">Today at ${msg.time}</span>
            </div>` : ''}
          <div class="message-text" data-msg-id="${msg.id}">${formatText(msg.content)}</div>
          ${buildAttachmentsHTML(msg.attachments)}
        </div>
        ${canDelete || canEdit ? `<div class="message-actions">
          ${canEdit ? `<button class="msg-action-btn msg-edit-btn" data-msg-id="${msg.id}" title="Edit message">${EDIT_ICON}</button>` : ''}
          ${canDelete ? `<button class="msg-action-btn msg-delete-btn" data-msg-id="${msg.id}" title="Delete message">${DELETE_ICON}</button>` : ''}
        </div>` : ''}
      </div>`;
  }).join('');
}


// --- Message rendering ---

function toDisplayMessage(m) {
  return { from: m.from, content: m.content, id: m.id, time: formatTime(), attachments: m.attachments || [] };
}

function renderMessages(history) {
  renderedMessages = [...history].reverse().map(toDisplayMessage);
  rebuildDOM();
}

function rebuildDOM() {
  const container = document.getElementById('messages-container');
  const atBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 80;

  let top = '';

  if (hasMoreMessages) {
    top = `<div class="load-more-container"><button class="load-more-btn" id="load-more-btn">Load older messages</button></div>`;
  } else {
    top = `
      <div class="welcome-message">
        <div class="welcome-icon">#</div>
        <h1>Welcome to #${esc(currentChannel)}</h1>
        <p>This is the start of the #${esc(currentChannel)} channel.</p>
      </div>`;
  }

  container.innerHTML = top + buildMessageHTML(renderedMessages);

  if (hasMoreMessages) {
    document.getElementById('load-more-btn').addEventListener('click', loadMoreMessages);
  }

  if (atBottom) container.scrollTop = container.scrollHeight;
}


// --- Member list ---

async function renderMemberList(members) {
  await ensureProfilePics(members);

  const sidebar = document.getElementById('members-sidebar');
  const isOwner = session && currentServerOwner === session.username;

  let html = `
    <div class="member-header-row">
      <div class="member-category"><span>CHANNEL MEMBERS — ${members.length}</span></div>
      ${isOwner ? `<button class="invite-user-btn" title="Invite user to channel">+</button>` : ''}
    </div>`;

  members.forEach(name => {
    const { inner, bg } = avatarHTML(name, profilePicCache.get(name));
    const isSelf = session && name === session.username;
    const ownerBadge = name === currentServerOwner ? `<span class="owner-badge">(owner)</span>` : '';

    html += `
      <div class="member">
        <div class="member-avatar" style="background:${bg}">${inner}</div>
        <div class="member-info"><span class="member-name">${esc(name)}${ownerBadge}</span></div>
        ${isOwner && !isSelf ? `<button class="kick-btn" data-username="${esc(name)}" title="Kick from channel">&#215;</button>` : ''}
      </div>`;
  });

  sidebar.innerHTML = html;
}


// --- Server list ---

function renderServerList(servers) {
  const container = document.getElementById('server-icons-container');
  container.innerHTML = '';

  let draggedEl = null;

  servers.forEach(s => {
    if (s.thumbnail && s.thumbnail !== 'none') {
      serverThumbnailCache.set(s.id, s.thumbnail);
    } else {
      serverThumbnailCache.set(s.id, null);
    }

    const el = document.createElement('div');
    el.className = 'server-icon';
    el.dataset.server = s.id;
    el.title = s.name;
    el.draggable = true;

    const thumb = serverThumbnailCache.get(s.id);
    if (thumb) {
      el.innerHTML = `<img src="/media/${thumb}" alt="${esc(s.name)}">`;
    } else {
      el.textContent = s.name[0].toUpperCase();
    }

    if (s.id === currentServer) el.classList.add('active');
    el.addEventListener('click', () => switchServer(s.id));

    el.addEventListener('dragstart', e => {
      draggedEl = el;
      el.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });

    el.addEventListener('dragend', () => {
      el.classList.remove('dragging');
      draggedEl = null;
      container.querySelectorAll('.server-icon').forEach(c => c.classList.remove('drag-over'));

      const newOrder = [...container.querySelectorAll('.server-icon[data-server]')].map(c => c.dataset.server);
      userServerOrder = newOrder;
      saveServerOrder(newOrder);
    });

    el.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (!draggedEl || draggedEl === el) return;

      const rect = el.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      if (e.clientY < midY) {
        container.insertBefore(draggedEl, el);
      } else {
        container.insertBefore(draggedEl, el.nextSibling);
      }
    });

    container.appendChild(el);
  });
}


// --- Channel sidebar ---

function renderChannelSidebar(serverData) {
  document.querySelector('.server-name').textContent = serverData ? serverData.name : 'Neutrino';

  const list = document.getElementById('channel-list');
  const isOwner = session && serverData && session.username === serverData.owner;
  let html = '';

  if (serverData && serverData.categories && serverData.categories.length > 0) {
    serverData.categories.forEach(cat => {
      const collapsed = collapsedCategories.has(cat.name);

      html += `
        <div class="channel-category${collapsed ? ' collapsed' : ''}" data-category="${esc(cat.name)}">
          <span class="category-toggle">&#9662;</span>
          <span class="category-name">${esc(cat.name.toUpperCase())}</span>
          ${isOwner ? `
            <button class="add-channel-btn" data-category="${esc(cat.name)}" title="Add channel">+</button>
            <button class="remove-cat-btn" data-category="${esc(cat.name)}" title="Delete category">&#215;</button>
          ` : ''}
        </div>
        <div class="category-channels${collapsed ? ' collapsed' : ''}" data-category="${esc(cat.name)}">`;

      (cat.channels || []).forEach(ch => {
        const name   = ch.name;
        const active = name === currentChannel && cat.name === currentCategory ? ' active' : '';
        const key    = `${currentServer}/${cat.name}/${name}`;
        const unread = lastReadIds.has(key) && ch.latestMsgId > lastReadIds.get(key) ? ' unread' : '';

        html += `
          <div class="channel${active}${unread}" data-channel="${esc(name)}" data-category="${esc(cat.name)}">
            <span class="channel-hash">#</span>
            <span class="channel-name">${esc(name)}</span>
            ${isOwner ? `<button class="remove-channel-btn" data-channel="${esc(name)}" data-category="${esc(cat.name)}" title="Delete channel">&#215;</button>` : ''}
          </div>`;
      });

      html += `</div>`;
    });
  }

  if (isOwner) {
    html += `<div class="add-category-row"><button class="add-category-btn">+ Add Category</button></div>`;
  }

  list.innerHTML = html;

  // Channel click

  list.querySelectorAll('.channel').forEach(el => {
    el.addEventListener('click', () => switchChannel(el.dataset.category, el.dataset.channel));
  });

  // Category toggle

  list.querySelectorAll('.channel-category').forEach(catEl => {
    catEl.addEventListener('click', e => {
      if (e.target.closest('.add-channel-btn') || e.target.closest('.remove-cat-btn')) return;

      const catName = catEl.dataset.category;
      const channelsDiv = list.querySelector(`.category-channels[data-category="${catName}"]`);

      if (collapsedCategories.has(catName)) {
        collapsedCategories.delete(catName);
        catEl.classList.remove('collapsed');
        if (channelsDiv) channelsDiv.classList.remove('collapsed');
      } else {
        collapsedCategories.add(catName);
        catEl.classList.add('collapsed');
        if (channelsDiv) channelsDiv.classList.add('collapsed');
      }
    });
  });

  // Add channel

  list.querySelectorAll('.add-channel-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      promptCreateChannel(btn.dataset.category);
    });
  });

  // Remove category

  list.querySelectorAll('.remove-cat-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      if (confirm(`Delete category "${btn.dataset.category}" and all its channels?`)) {
        removeCategory(btn.dataset.category);
      }
    });
  });

  // Remove channel

  list.querySelectorAll('.remove-channel-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      if (confirm(`Delete channel #${btn.dataset.channel}?`)) {
        removeChannel(btn.dataset.category, btn.dataset.channel);
      }
    });
  });

  // Add category

  const addCatBtn = list.querySelector('.add-category-btn');
  if (addCatBtn) {
    addCatBtn.addEventListener('click', () => promptCreateCategory());
  }
}


// --- Attachment previews ---

function renderAttachmentPreviews() {
  const strip = document.getElementById('attachment-preview-strip');
  if (!strip) return;

  if (pendingAttachments.length === 0) {
    strip.innerHTML = '';
    return;
  }

  strip.innerHTML = pendingAttachments.map((a, i) => {
    const isImage = a.mimeType.startsWith('image/');
    const thumb = isImage
      ? `<img class="attachment-preview-thumb" src="${a.objectURL}" alt="">`
      : `<div class="attachment-preview-icon">${VIDEO_ICON}</div>`;

    return `
      <div class="attachment-preview-item">
        ${thumb}
        <span class="attachment-preview-name" title="${esc(a.name)}">${esc(a.name)}</span>
        <button class="attachment-preview-remove" data-idx="${i}" title="Remove">&#215;</button>
      </div>`;
  }).join('');

  strip.querySelectorAll('.attachment-preview-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx);
      if (!isNaN(idx) && pendingAttachments[idx]) {
        URL.revokeObjectURL(pendingAttachments[idx].objectURL);
        pendingAttachments.splice(idx, 1);
        renderAttachmentPreviews();
      }
    });
  });
}


// --- Server/channel CRUD ---

async function promptCreateCategory() {
  const name = prompt('Category name:');
  if (!name || !name.trim()) return;

  const { ok } = await apiPost(`/new/category/${enc(currentServer)}/${enc(name.trim())}`, authBody());
  if (!ok) { alert('Could not create category.'); return; }

  const data = await fetchServerData(currentServer);
  renderChannelSidebar(data);
}

async function promptCreateChannel(categoryName) {
  const name = prompt(`Channel name (in ${categoryName}):`);
  if (!name || !name.trim()) return;

  const { ok } = await apiPost(
    `/new/channel/${enc(currentServer)}/${enc(categoryName)}/${enc(name.trim())}`,
    authBody()
  );
  if (!ok) { alert('Could not create channel.'); return; }

  const data = await fetchServerData(currentServer);
  renderChannelSidebar(data);
}

async function removeCategory(categoryName) {
  const { ok } = await apiPost(`/remove/category/${enc(currentServer)}/${enc(categoryName)}`, authBody());
  if (!ok) { alert('Could not delete category.'); return; }

  if (currentCategory === categoryName) {
    currentCategory = null;
    currentChannel = null;
    lastSeenId = -1;
    stopPolling();
  }

  const data = await fetchServerData(currentServer);
  renderChannelSidebar(data);

  const first = document.querySelector('.channel[data-channel]');
  if (first) first.click();
}

async function removeChannel(categoryName, channelName) {
  const { ok } = await apiPost(
    `/remove/channel/${enc(currentServer)}/${enc(categoryName)}/${enc(channelName)}`,
    authBody()
  );
  if (!ok) { alert('Could not delete channel.'); return; }

  if (currentChannel === channelName && currentCategory === categoryName) {
    currentCategory = null;
    currentChannel = null;
    lastSeenId = -1;
    stopPolling();
  }

  const data = await fetchServerData(currentServer);
  renderChannelSidebar(data);

  const first = document.querySelector('.channel[data-channel]');
  if (first) first.click();
}

async function deleteServer() {
  if (!currentServer) return;
  if (!confirm(`Delete server "${currentServerName || currentServer}"? This cannot be undone.`)) return;

  const { ok } = await apiPost(`/remove/server/${enc(currentServer)}`, authBody());
  if (!ok) { alert('Could not delete server. You may not be the owner.'); return; }

  await recoverFromServerLoss();
}

async function leaveServer() {
  if (!currentServer) return;
  if (!confirm(`Leave server "${currentServerName || currentServer}"?`)) return;

  const { ok } = await apiPost(`/leave/server/${enc(currentServer)}`, authBody());
  if (!ok) { alert('Could not leave server.'); return; }

  await recoverFromServerLoss();
}

async function deleteMessage(msgId) {
  const { ok } = await apiPost(
    `/remove/message/${enc(currentServer)}/${enc(currentCategory)}/${enc(currentChannel)}/${msgId}`,
    authBody()
  );
  if (!ok) { alert('Could not delete message.'); return; }

  renderedMessages = renderedMessages.filter(m => m.id !== msgId);
  rebuildDOM();
}

function startEditMessage(msgId) {
  const msg = renderedMessages.find(m => m.id === msgId);
  if (!msg) return;

  const textEl = document.querySelector(`.message-text[data-msg-id="${msgId}"]`);
  if (!textEl || textEl.querySelector('.edit-input')) return;

  const original = msg.content;

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'edit-input';
  input.value = original;
  input.maxLength = 2048;

  textEl.textContent = '';
  textEl.appendChild(input);
  input.focus();
  input.select();

  const finish = async (save) => {
    input.removeEventListener('keydown', onKey);
    input.removeEventListener('blur', onBlur);

    if (save && input.value.trim() && input.value !== original) {
      const { ok } = await apiPost(
        `/edit/message/${enc(currentServer)}/${enc(currentCategory)}/${enc(currentChannel)}/${msgId}`,
        authBody({ content: input.value.trim() })
      );

      if (ok) {
        msg.content = input.value.trim();
      }
    }

    textEl.innerHTML = formatText(msg.content);
  };

  const onKey = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); finish(true); }
    if (e.key === 'Escape') { e.preventDefault(); finish(false); }
  };

  const onBlur = () => finish(true);

  input.addEventListener('keydown', onKey);
  input.addEventListener('blur', onBlur);
}


// --- Member actions ---

async function toggleAddMemberDropdown() {
  const existing = document.getElementById('add-member-dropdown');
  if (existing) { existing.remove(); return; }

  const available = currentServerMembers.filter(m => !currentChannelMembers.includes(m));
  await ensureProfilePics(available);

  const dropdown = document.createElement('div');
  dropdown.id = 'add-member-dropdown';
  dropdown.className = 'add-member-dropdown';

  if (available.length === 0) {
    dropdown.innerHTML = '<div class="add-member-empty">All server members are in this channel</div>';
  } else {
    available.forEach(name => {
      const { inner, bg } = avatarHTML(name, profilePicCache.get(name));
      const item = document.createElement('div');
      item.className = 'add-member-item';
      item.innerHTML = `<div class="member-avatar" style="background:${bg}">${inner}</div><span>${esc(name)}</span>`;
      item.addEventListener('click', () => addUserToChannel(name));
      dropdown.appendChild(item);
    });
  }

  const sidebar = document.getElementById('members-sidebar');
  const header = sidebar.querySelector('.member-header-row');
  header.style.position = 'relative';
  header.appendChild(dropdown);

  const close = (e) => {
    if (!dropdown.contains(e.target) && !e.target.closest('.invite-user-btn')) {
      dropdown.remove();
      document.removeEventListener('click', close);
    }
  };
  setTimeout(() => document.addEventListener('click', close), 0);
}

async function addUserToChannel(username) {
  const dropdown = document.getElementById('add-member-dropdown');
  if (dropdown) dropdown.remove();

  const { ok } = await apiPost(
    `/invite/channel/${enc(username)}/${enc(currentServer)}/${enc(currentCategory)}/${enc(currentChannel)}`,
    authBody()
  );

  if (ok) {
    const data = await fetchChannelData(currentServer, currentCategory, currentChannel);
    if (data) {
      currentChannelMembers = data.members || [];
      await renderMemberList(currentChannelMembers);
    }
  } else {
    alert('Could not add user to channel.');
  }
}

async function inviteToServer() {
  if (!currentServer) return;

  const username = prompt('Username to invite:');
  if (!username || !username.trim()) return;

  const { ok, data } = await apiPost(
    `/invite/server/${enc(username.trim())}/${enc(currentServer)}`,
    authBody()
  );

  if (ok) {
    const sdata = await fetchServerData(currentServer);
    if (sdata) {
      currentServerMembers = sdata.members || [];
      if (currentChannel) {
        const cdata = await fetchChannelData(currentServer, currentCategory, currentChannel);
        if (cdata) {
          currentChannelMembers = cdata.members || [];
          await renderMemberList(currentChannelMembers);
        }
      }
    }
  } else {
    const msg = (data && data.message) || 'Could not invite user.';
    alert(msg);
  }
}

async function kickFromServer() {
  if (!currentServer) return;

  const kickable = currentServerMembers.filter(m => m !== session.username && m !== currentServerOwner);
  if (kickable.length === 0) { alert('No members to kick.'); return; }

  const username = prompt('Username to kick:\n\nMembers: ' + kickable.join(', '));
  if (!username || !username.trim()) return;

  if (!kickable.includes(username.trim())) {
    alert('User is not a kickable member of this server.');
    return;
  }

  if (!confirm(`Kick ${username.trim()} from this server? They will be removed from all channels.`)) return;

  const { ok, data } = await apiPost(
    `/kick/server/${enc(username.trim())}/${enc(currentServer)}`,
    authBody()
  );

  if (ok) {
    const sdata = await fetchServerData(currentServer);
    if (sdata) {
      currentServerMembers = sdata.members || [];
      if (currentChannel) {
        const cdata = await fetchChannelData(currentServer, currentCategory, currentChannel);
        if (cdata) {
          currentChannelMembers = cdata.members || [];
          await renderMemberList(currentChannelMembers);
        }
      }
    }
  } else {
    const msg = (data && data.message) || 'Could not kick user.';
    alert(msg);
  }
}

async function kickUserFromChannel(username) {
  const { ok } = await apiPost(
    `/kick/channel/${enc(username)}/${enc(currentServer)}/${enc(currentCategory)}/${enc(currentChannel)}`,
    authBody()
  );

  if (ok) {
    const data = await fetchChannelData(currentServer, currentCategory, currentChannel);
    if (data) {
      currentChannelMembers = data.members || [];
      await renderMemberList(currentChannelMembers);
    }
  } else {
    alert('Could not kick user.');
  }
}


// --- Account actions ---

async function changeProfilePic() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/png,image/jpeg,image/gif,image/webp';

  input.onchange = async () => {
    if (!input.files || !input.files[0]) return;

    const result = await apiUpload(input.files[0]);
    if (!result.ok) { alert('Could not upload image.'); return; }

    const id = result.data.data.id;
    const { ok } = await apiPost(`/edit/profilepic/${id}`, authBody());
    if (!ok) { alert('Could not set profile picture.'); return; }

    session.profilePic = id;
    saveSession();
    profilePicCache.set(session.username, id);
    updateUserUI();
  };

  input.click();
}

async function changeServerThumbnail() {
  if (!currentServer) return;

  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/png,image/jpeg,image/gif,image/webp';

  input.onchange = async () => {
    if (!input.files || !input.files[0]) return;

    const result = await apiUpload(input.files[0]);
    if (!result.ok) { alert('Could not upload image.'); return; }

    const id = result.data.data.id;
    const { ok } = await apiPost(`/edit/thumbnail/${enc(currentServer)}/${id}`, authBody());
    if (!ok) { alert('Could not set server thumbnail. You must be the server owner.'); return; }

    serverThumbnailCache.set(currentServer, id);

    const icon = document.querySelector(`.server-icon[data-server="${currentServer}"]`);
    if (icon) {
      icon.innerHTML = `<img src="/media/${id}" alt="${esc(currentServerName || '')}">`;
    }
  };

  input.click();
}

async function handleFilesSelected(files) {
  if (!files || files.length === 0) return;

  for (const file of files) {
    if (pendingAttachments.length >= 10) {
      alert('Maximum 10 attachments per message.');
      break;
    }

    const result = await apiUpload(file);
    if (!result.ok) {
      alert(result.data && result.data.message ? result.data.message : 'Upload failed.');
      continue;
    }

    pendingAttachments.push({
      id: result.data.data.id,
      mimeType: result.data.data.mimeType,
      name: file.name,
      objectURL: URL.createObjectURL(file),
    });

    renderAttachmentPreviews();
  }
}

async function changeUsername() {
  const newName = prompt('New username:');
  if (!newName || !newName.trim()) return;

  const { ok } = await apiPost(`/edit/user/${enc(newName.trim())}`, authBody());
  if (!ok) { alert('Could not change username. It may already be taken.'); return; }

  session.username = newName.trim();
  saveSession();
  updateUserUI();
}

async function changePassword() {
  const current = prompt('Current password:');
  if (!current) return;

  const newPass = prompt('New password:');
  if (!newPass) return;

  const { ok } = await apiPost('/edit/password', authBody({ password: current, newPassword: newPass }));
  if (!ok) { alert('Could not change password. Current password may be wrong.'); return; }

  alert('Password changed.');
}

async function deleteAccount() {
  const password = prompt('Enter your password to permanently delete your account:');
  if (!password) return;

  const { ok } = await apiPost('/remove/user', {
    username: session.username,
    token: session.token,
    password,
  });

  if (ok) {
    clearSession();
    location.reload();
  } else {
    alert('Could not delete account. You may still own servers, or the password is wrong.');
  }
}


// --- Navigation ---

async function switchServer(serverId) {
  if (exploreOpen) closeExplore();
  closeEmojiPicker();
  stopPolling();

  const gen = ++navGeneration;

  currentServer        = serverId;
  currentServerName    = null;
  currentServerOwner   = null;
  currentServerPublic  = true;
  currentServerMembers = [];
  lastServerStructure  = null;
  currentCategory      = null;
  currentChannel       = null;
  currentChannelMembers = [];
  lastSeenId          = -1;
  renderedMessages    = [];
  hasMoreMessages     = false;

  collapsedCategories.clear();

  document.querySelectorAll('.server-icon[data-server]').forEach(el => {
    el.classList.toggle('active', el.dataset.server === serverId);
  });

  document.getElementById('chat-channel-name').textContent = '—';
  document.getElementById('channel-topic').textContent = '';
  document.getElementById('message-input').placeholder = 'Select a channel first';
  document.getElementById('message-input').disabled = true;
  document.getElementById('messages-container').innerHTML = `
    <div class="welcome-message">
      <div class="welcome-icon">…</div>
      <h1>Loading…</h1>
      <p>Select a channel to start chatting.</p>
    </div>`;

  const serverData = await fetchServerData(serverId);
  if (gen !== navGeneration) return;

  if (!serverData || !serverData.members || !serverData.members.includes(session.username)) {
    await recoverFromServerLoss();
    return;
  }

  currentServerName    = serverData.name;
  currentServerOwner   = serverData.owner;
  currentServerPublic  = !!serverData.public;
  currentServerMembers = serverData.members || [];
  lastServerStructure  = JSON.stringify(
    (serverData.categories || []).map(cat => ({ name: cat.name, channels: (cat.channels || []).map(ch => ch.name) }))
  );

  // Seed unread tracking: mark all channels as read on first visit
  for (const cat of serverData.categories || []) {
    for (const ch of cat.channels || []) {
      const key = `${serverId}/${cat.name}/${ch.name}`;
      if (!lastReadIds.has(key)) {
        lastReadIds.set(key, ch.latestMsgId);
      }
    }
  }

  if (serverData.thumbnail && serverData.thumbnail !== 'none') {
    serverThumbnailCache.set(serverId, serverData.thumbnail);
  }

  const isOwner = session && session.username === serverData.owner;
  document.getElementById('delete-server-btn').style.display = isOwner ? '' : 'none';
  document.getElementById('server-menu-btn').style.display = isOwner ? '' : 'none';
  document.getElementById('leave-server-btn').style.display = isOwner ? 'none' : '';
  updateVisibilityBtn();

  renderChannelSidebar(serverData);

  const first = document.querySelector('.channel[data-channel]');
  if (first) {
    first.click();
  } else {
    renderServerLanding(serverData);
  }
}

async function switchChannel(categoryName, channelName) {
  closeEmojiPicker();
  stopPolling();

  pendingAttachments.forEach(a => URL.revokeObjectURL(a.objectURL));
  pendingAttachments = [];
  renderAttachmentPreviews();

  const gen = ++navGeneration;

  currentCategory  = categoryName;
  currentChannel   = channelName;
  lastSeenId       = -1;
  renderedMessages = [];
  hasMoreMessages  = false;

  document.querySelectorAll('.channel').forEach(el => {
    el.classList.toggle('active',
      el.dataset.channel === channelName && el.dataset.category === categoryName);
    if (el.dataset.channel === channelName && el.dataset.category === categoryName) {
      el.classList.remove('unread');
    }
  });

  document.getElementById('chat-channel-name').textContent = categoryName;
  document.getElementById('channel-topic').textContent = `#${channelName}`;
  document.getElementById('message-input').placeholder = `Message #${channelName}`;
  document.getElementById('message-input').disabled = false;

  const data = await fetchChannelData(currentServer, categoryName, channelName);
  if (gen !== navGeneration) return;

  if (!data) {
    await recoverFromChannelLoss();
    return;
  }

  hasMoreMessages = !!data.hasMore;

  const allUsers = [
    ...(data.members || []),
    ...(data.history || []).map(m => m.from),
  ];
  await ensureProfilePics(allUsers);

  currentChannelMembers = data.members || [];
  renderMessages(data.history || []);
  await renderMemberList(currentChannelMembers);

  if (data.history && data.history.length > 0) {
    lastSeenId = data.history[0].id;
  }

  const readKey = `${currentServer}/${categoryName}/${channelName}`;
  lastReadIds.set(readKey, lastSeenId);

  startPolling();
}


// --- Polling ---

function startPolling() {
  stopPolling();
  pollTimer = setInterval(poll, 5000);
}

function stopPolling() {
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
}

function startSessionCheck() {
  stopSessionCheck();
  sessionCheckTimer = setInterval(sessionHeartbeat, 5000);
}

function stopSessionCheck() {
  if (sessionCheckTimer) { clearInterval(sessionCheckTimer); sessionCheckTimer = null; }
}

async function sessionHeartbeat() {
  if (!session) return;

  const alive = await checkSessionAlive();
  if (!alive) {
    stopPolling();
    stopSessionCheck();
    clearSession();
    location.reload();
  }
}

async function poll() {
  if (!session || !currentServer) return;
  const gen = navGeneration;

  const serverData = await fetchServerData(currentServer);
  if (!session || gen !== navGeneration) return;

  if (!serverData || !serverData.members || !serverData.members.includes(session.username)) {
    await recoverFromServerLoss();
    return;
  }

  currentServerMembers = serverData.members || [];

  // Sync name

  if (serverData.name && serverData.name !== currentServerName) {
    currentServerName = serverData.name;
    document.querySelector('.server-name').textContent = currentServerName;
  }

  // Sync thumbnail

  const newThumb = serverData.thumbnail && serverData.thumbnail !== 'none' ? serverData.thumbnail : null;
  const oldThumb = serverThumbnailCache.get(currentServer) || null;

  if (newThumb !== oldThumb) {
    serverThumbnailCache.set(currentServer, newThumb);
    const icon = document.querySelector(`.server-icon[data-server="${currentServer}"]`);

    if (icon) {
      if (newThumb) {
        icon.innerHTML = `<img src="/media/${newThumb}" alt="${esc(currentServerName || '')}">`;
      } else {
        icon.innerHTML = '';
        icon.textContent = (currentServerName || '?')[0].toUpperCase();
      }
    }
  }

  // Sync structure (compare names only so latestMsgId changes don't trigger full re-render)

  const structureNames = JSON.stringify(
    (serverData.categories || []).map(cat => ({ name: cat.name, channels: (cat.channels || []).map(ch => ch.name) }))
  );

  if (structureNames !== lastServerStructure) {
    lastServerStructure = structureNames;
    renderChannelSidebar(serverData);

    if (currentChannel) {
      const stillExists = (serverData.categories || []).some(cat =>
        cat.name === currentCategory && (cat.channels || []).some(ch => ch.name === currentChannel)
      );
      if (!stillExists) {
        await recoverFromChannelLoss();
        return;
      }
    }
  }

  // Sync unread indicators

  let hasUnreadChange = false;
  for (const cat of serverData.categories || []) {
    for (const ch of cat.channels || []) {
      const key = `${currentServer}/${cat.name}/${ch.name}`;
      const readId = lastReadIds.get(key);

      if (readId !== undefined && ch.latestMsgId > readId) {
        if (ch.name === currentChannel && cat.name === currentCategory) {
          lastReadIds.set(key, ch.latestMsgId);
        } else {
          hasUnreadChange = true;
        }
      }
    }
  }

  if (hasUnreadChange) {
    renderChannelSidebar(serverData);
  }

  // Poll messages

  if (!currentChannel) return;

  if (lastSeenId < 0) {
    const data = await fetchChannelData(currentServer, currentCategory, currentChannel);
    if (!session || gen !== navGeneration) return;
    if (!data) { await recoverFromChannelLoss(); return; }

    currentChannelMembers = data.members || [];
    if (data.history && data.history.length > 0) {
      hasMoreMessages = !!data.hasMore;
      renderMessages(data.history);
      lastSeenId = data.history[0].id;
    }
    await renderMemberList(currentChannelMembers);
    return;
  }

  const newMsgs = await fetchNewMessages(currentServer, currentCategory, currentChannel, lastSeenId);
  if (!session || gen !== navGeneration) return;

  if (newMsgs === null) {
    await recoverFromChannelLoss();
    return;
  }

  if (newMsgs.length > 0) {
    lastSeenId = newMsgs[0].id;
    await ensureProfilePics(newMsgs.map(m => m.from));

    const toAdd = [...newMsgs].reverse().map(toDisplayMessage);
    renderedMessages.push(...toAdd);
    rebuildDOM();
  }

  // Sync channel members

  const chanData = await fetchChannelData(currentServer, currentCategory, currentChannel);
  if (!session || gen !== navGeneration) return;
  if (!chanData) return;

  const newMembers = chanData.members || [];
  if (JSON.stringify(newMembers) !== JSON.stringify(currentChannelMembers)) {
    currentChannelMembers = newMembers;
    await renderMemberList(currentChannelMembers);
  }
}


// --- Recovery ---

async function recoverFromChannelLoss() {
  stopPolling();

  currentCategory  = null;
  currentChannel   = null;
  lastSeenId       = -1;
  renderedMessages = [];
  hasMoreMessages  = false;

  const serverData = await fetchServerData(currentServer);

  if (!serverData || !serverData.members || !serverData.members.includes(session.username)) {
    await recoverFromServerLoss();
    return;
  }

  renderChannelSidebar(serverData);

  const first = document.querySelector('.channel[data-channel]');
  if (first) {
    first.click();
  } else {
    renderServerLanding(serverData);
  }
}

async function recoverFromServerLoss() {
  stopPolling();

  currentServer        = null;
  currentServerName    = null;
  currentServerOwner   = null;
  currentServerPublic  = true;
  currentServerMembers = [];
  lastServerStructure  = null;
  currentCategory      = null;
  currentChannel       = null;
  currentChannelMembers = [];
  lastSeenId           = -1;
  renderedMessages     = [];
  hasMoreMessages      = false;

  const accessible = await fetchMyServers();
  renderServerList(accessible);

  if (accessible.length > 0) {
    await switchServer(accessible[0].id);
    return;
  }

  document.querySelector('.server-name').textContent = 'No servers';
  document.getElementById('channel-list').innerHTML =
    '<div style="padding:16px;color:var(--text-muted);font-size:13px">No servers yet. Click + to create one.</div>';
  resetChatArea('No server selected');
}


// --- Landing pages ---

function resetChatArea(reason) {
  document.getElementById('chat-channel-name').textContent = '—';
  document.getElementById('channel-topic').textContent = '';
  document.getElementById('message-input').placeholder = reason;
  document.getElementById('message-input').disabled = true;
  document.getElementById('messages-container').innerHTML = `
    <div class="welcome-message">
      <div class="welcome-icon">N</div>
      <h1>Neutrino</h1>
      <p>${reason}.</p>
    </div>`;
  document.getElementById('members-sidebar').innerHTML =
    '<div class="member-category"><span>CHANNEL MEMBERS</span></div>';
}

function renderServerLanding(serverData) {
  const name = serverData.name || 'Server';
  const thumb = serverData.thumbnail && serverData.thumbnail !== 'none' ? serverData.thumbnail : null;
  const memberCount = (serverData.members || []).length;

  const iconInner = thumb
    ? `<img src="/media/${thumb}" alt="${esc(name)}" style="width:64px;height:64px;border-radius:50%;object-fit:cover">`
    : esc(name[0]).toUpperCase();

  document.getElementById('chat-channel-name').textContent = '—';
  document.getElementById('channel-topic').textContent = '';
  document.getElementById('message-input').placeholder = 'Select a channel first';
  document.getElementById('message-input').disabled = true;

  document.getElementById('messages-container').innerHTML = `
    <div class="welcome-message">
      <div class="welcome-icon">${iconInner}</div>
      <h1>Welcome to ${esc(name)}</h1>
      <p>Owned by ${esc(serverData.owner)} · ${memberCount} member${memberCount !== 1 ? 's' : ''}</p>
      <p style="color:var(--text-muted);font-size:13px;margin-top:4px">Select a channel to start chatting.</p>
    </div>`;

  document.getElementById('members-sidebar').innerHTML =
    '<div class="member-category"><span>CHANNEL MEMBERS</span></div>';
}


// --- Explore ---

async function openExplore() {
  stopPolling();
  exploreOpen = true;

  document.querySelectorAll('.server-icon[data-server]').forEach(el => el.classList.remove('active'));
  document.getElementById('explore-btn').classList.add('active');
  document.querySelector('.app').classList.add('exploring');
  document.getElementById('explore-panel').classList.add('open');

  const { servers: allServers } = await fetchManifest();
  const servers = allServers.filter(s => s.public);
  const grid = document.getElementById('explore-grid');

  if (servers.length === 0) {
    grid.innerHTML = '<div style="color:var(--text-muted);text-align:center;padding:32px">No public servers to explore. Create one with the + button.</div>';
    return;
  }

  grid.innerHTML = servers.map(s => {
    const thumb = s.thumbnail && s.thumbnail !== 'none' ? s.thumbnail : null;
    const iconInner = thumb
      ? `<img src="/media/${thumb}" alt="${esc(s.name)}">`
      : esc(s.name[0]).toUpperCase();

    return `
      <div class="explore-card" data-server="${s.id}">
        <div class="explore-card-icon">${iconInner}</div>
        <span class="explore-card-name">${esc(s.name)}</span>
        <span class="explore-card-owner">Owner: ${esc(s.owner)}</span>
      </div>`;
  }).join('');

  grid.querySelectorAll('.explore-card').forEach(card => {
    card.addEventListener('click', async () => {
      const serverId = card.dataset.server;
      await apiPost(`/join/server/${enc(serverId)}`, authBody());
      closeExplore();

      const servers = await fetchMyServers();
      renderServerList(servers);
      await switchServer(serverId);
    });
  });
}

function closeExplore() {
  exploreOpen = false;
  document.getElementById('explore-btn').classList.remove('active');
  document.querySelector('.app').classList.remove('exploring');
  document.getElementById('explore-panel').classList.remove('open');

  if (currentServer) {
    document.querySelectorAll('.server-icon[data-server]').forEach(el => {
      el.classList.toggle('active', el.dataset.server === currentServer);
    });
  }
}


// --- Message sending ---

async function sendMessage(text) {
  if (!text.trim() && pendingAttachments.length === 0) return;
  if (!currentServer || !currentChannel) return;

  if (text.trim().length > 2048) {
    alert('Message cannot exceed 2048 characters.');
    return;
  }

  const attachmentIds = pendingAttachments.map(a => a.id);
  pendingAttachments.forEach(a => URL.revokeObjectURL(a.objectURL));
  pendingAttachments = [];
  renderAttachmentPreviews();

  await apiPost(
    `/new/message/${enc(currentServer)}/${enc(currentCategory)}/${enc(currentChannel)}`,
    authBody({ content: text.trim(), attachments: attachmentIds })
  );

  if (lastSeenId < 0) {
    const data = await fetchChannelData(currentServer, currentCategory, currentChannel);
    if (data) {
      hasMoreMessages = !!data.hasMore;
      renderMessages(data.history || []);
      if (data.history && data.history.length > 0) lastSeenId = data.history[0].id;
    }
  } else {
    stopPolling();
    await poll();
    startPolling();
  }
}

async function loadMoreMessages() {
  if (loadingMore || !hasMoreMessages || !currentServer || !currentChannel) return;
  if (renderedMessages.length === 0) return;

  loadingMore = true;
  const btn = document.getElementById('load-more-btn');
  if (btn) btn.textContent = 'Loading…';

  const oldestId = renderedMessages[0].id;
  const data = await fetchChannelData(currentServer, currentCategory, currentChannel, oldestId);
  loadingMore = false;
  if (!data) return;

  hasMoreMessages = !!data.hasMore;
  await ensureProfilePics((data.history || []).map(m => m.from));

  const older = [...(data.history || [])].reverse().map(toDisplayMessage);

  const container = document.getElementById('messages-container');
  const prevHeight = container.scrollHeight;

  renderedMessages = [...older, ...renderedMessages];
  rebuildDOM();

  container.scrollTop += container.scrollHeight - prevHeight;
}


// --- UI helpers ---

function updateUserUI() {
  const name = session ? session.username : '?';
  document.getElementById('current-username').textContent = name;

  const av = document.getElementById('user-avatar');
  if (session && session.profilePic) {
    av.innerHTML = `<img src="/media/${session.profilePic}" alt="${esc(name)}">`;
    av.style.background = 'transparent';
  } else {
    av.textContent = name[0].toUpperCase();
    av.style.background = '';
  }
}

function updateVisibilityBtn() {
  const btn = document.getElementById('toggle-visibility-btn');
  if (btn) btn.textContent = currentServerPublic ? 'Make Private' : 'Make Public';
}

function showLogin() { document.getElementById('login-overlay').classList.add('open'); }
function hideLogin() { document.getElementById('login-overlay').classList.remove('open'); }

function closeEmojiPicker() {
  document.getElementById('emoji-picker').classList.remove('open');
}

function initEmojiPicker() {
  const grid = document.getElementById('emoji-grid');

  EMOJIS.forEach(e => {
    const btn = document.createElement('button');
    btn.className = 'emoji-item';
    btn.textContent = e;
    btn.addEventListener('click', () => {
      const input = document.getElementById('message-input');
      input.value += e;
      input.focus();
      document.getElementById('emoji-picker').classList.remove('open');
    });
    grid.appendChild(btn);
  });
}


// --- Init ---

document.addEventListener('DOMContentLoaded', async () => {
  loadSession();
  initEmojiPicker();

  // Login/register tabs

  document.getElementById('tab-login').addEventListener('click', () => {
    document.getElementById('tab-login').classList.add('active');
    document.getElementById('tab-register').classList.remove('active');
    document.getElementById('login-form').style.display = '';
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-error').textContent = '';
  });

  document.getElementById('tab-register').addEventListener('click', () => {
    document.getElementById('tab-register').classList.add('active');
    document.getElementById('tab-login').classList.remove('active');
    document.getElementById('register-form').style.display = '';
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('reg-error').textContent = '';
  });

  // Login

  async function doLogin() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const errEl = document.getElementById('login-error');

    if (!username || !password) { errEl.textContent = 'Fill in all fields.'; return; }

    errEl.textContent = 'Logging in…';
    const ok = await login(username, password);

    if (ok) { hideLogin(); await initApp(); }
    else { errEl.textContent = 'Invalid username or password.'; }
  }

  document.getElementById('login-btn').addEventListener('click', doLogin);
  document.getElementById('login-password').addEventListener('keydown', e => {
    if (e.key === 'Enter') doLogin();
  });
  document.getElementById('login-username').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('login-password').focus();
  });

  // Register

  async function doRegister() {
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value;
    const errEl = document.getElementById('reg-error');

    if (!username || !password) { errEl.textContent = 'Fill in all fields.'; return; }

    errEl.textContent = 'Creating account…';
    const ok = await register(username, password);

    if (ok) {
      errEl.style.color = '#23a559';
      errEl.textContent = 'Account created! You can now log in.';
      document.getElementById('reg-password').value = '';
      setTimeout(() => {
        document.getElementById('tab-login').click();
        document.getElementById('login-username').value = username;
        document.getElementById('login-password').focus();
      }, 900);
    } else {
      errEl.style.color = 'var(--red)';
      errEl.textContent = 'Could not create account. Username may already be taken.';
    }
  }

  document.getElementById('reg-btn').addEventListener('click', doRegister);
  document.getElementById('reg-password').addEventListener('keydown', e => {
    if (e.key === 'Enter') doRegister();
  });

  // Message input

  document.getElementById('message-input').addEventListener('keydown', async e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const text = e.target.value;
      e.target.value = '';
      await sendMessage(text);
    }
  });

  // Attachments

  document.getElementById('attach-btn').addEventListener('click', () => {
    document.getElementById('file-input').click();
  });

  document.getElementById('file-input').addEventListener('change', async e => {
    await handleFilesSelected(e.target.files);
    e.target.value = '';
  });

  // Emoji picker

  document.getElementById('emoji-btn').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('emoji-picker').classList.toggle('open');
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('#emoji-picker') && !e.target.closest('#emoji-btn')) {
      closeEmojiPicker();
    }
  });

  // Message delete (delegated)

  document.getElementById('messages-container').addEventListener('click', async e => {
    const editBtn = e.target.closest('.msg-edit-btn');
    if (editBtn) {
      const msgId = parseInt(editBtn.dataset.msgId);
      if (!isNaN(msgId)) startEditMessage(msgId);
      return;
    }

    const delBtn = e.target.closest('.msg-delete-btn');
    if (delBtn) {
      if (!confirm('Delete this message?')) return;
      const msgId = parseInt(delBtn.dataset.msgId);
      if (!isNaN(msgId)) await deleteMessage(msgId);
      return;
    }
  });

  // Member invite/kick (delegated)

  document.getElementById('members-sidebar').addEventListener('click', async e => {
    const kickBtn = e.target.closest('.kick-btn');
    if (kickBtn) {
      if (confirm(`Kick ${kickBtn.dataset.username} from #${currentChannel}?`)) {
        await kickUserFromChannel(kickBtn.dataset.username);
      }
      return;
    }

    const inviteBtn = e.target.closest('.invite-user-btn');
    if (inviteBtn) toggleAddMemberDropdown();
  });

  // Explore

  document.getElementById('explore-btn').addEventListener('click', () => {
    if (exploreOpen) {
      closeExplore();
      if (currentServer) switchServer(currentServer);
    } else {
      openExplore();
    }
  });

  // Toggle members

  document.getElementById('toggle-members').addEventListener('click', function () {
    document.getElementById('members-sidebar').classList.toggle('hidden');
    this.classList.toggle('active');
  });

  // Account menu

  const accountMenu = document.getElementById('account-menu');

  document.getElementById('account-menu-btn').addEventListener('click', e => {
    e.stopPropagation();
    accountMenu.classList.toggle('open');
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('#account-menu') && !e.target.closest('#account-menu-btn')) {
      accountMenu.classList.remove('open');
    }
  });

  document.getElementById('change-pfp-btn').addEventListener('click', () => {
    accountMenu.classList.remove('open');
    changeProfilePic();
  });

  document.getElementById('change-username-btn').addEventListener('click', () => {
    accountMenu.classList.remove('open');
    changeUsername();
  });

  document.getElementById('change-password-btn').addEventListener('click', () => {
    accountMenu.classList.remove('open');
    changePassword();
  });

  document.getElementById('logout-btn').addEventListener('click', () => {
    accountMenu.classList.remove('open');
    if (confirm('Log out of Neutrino?')) logout();
  });

  document.getElementById('delete-account-btn').addEventListener('click', () => {
    accountMenu.classList.remove('open');
    deleteAccount();
  });

  // Server menu

  const serverMenu = document.getElementById('server-menu');

  document.getElementById('server-menu-btn').addEventListener('click', e => {
    e.stopPropagation();
    serverMenu.classList.toggle('open');
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('#server-menu') && !e.target.closest('#server-menu-btn')) {
      serverMenu.classList.remove('open');
    }
  });

  document.getElementById('change-thumbnail-btn').addEventListener('click', () => {
    serverMenu.classList.remove('open');
    changeServerThumbnail();
  });

  document.getElementById('remove-thumbnail-btn').addEventListener('click', async () => {
    serverMenu.classList.remove('open');
    if (!currentServer) return;

    const { ok } = await apiPost(`/edit/thumbnail/${enc(currentServer)}/none`, authBody());
    if (!ok) { alert('Could not remove thumbnail. You must be the server owner.'); return; }

    serverThumbnailCache.set(currentServer, null);

    const icon = document.querySelector(`.server-icon[data-server="${currentServer}"]`);
    if (icon) {
      icon.innerHTML = '';
      icon.textContent = (currentServerName || '?')[0].toUpperCase();
    }
  });

  document.getElementById('invite-to-server-btn').addEventListener('click', () => {
    serverMenu.classList.remove('open');
    inviteToServer();
  });

  document.getElementById('kick-from-server-btn').addEventListener('click', () => {
    serverMenu.classList.remove('open');
    kickFromServer();
  });

  document.getElementById('toggle-visibility-btn').addEventListener('click', async () => {
    serverMenu.classList.remove('open');
    if (!currentServer) return;

    const newPublic = !currentServerPublic;
    const { ok } = await apiPost(`/edit/visibility/${enc(currentServer)}`, authBody({ public: newPublic }));
    if (!ok) { alert('Could not change server visibility.'); return; }

    currentServerPublic = newPublic;
    updateVisibilityBtn();
  });

  // Delete server

  document.getElementById('delete-server-btn').addEventListener('click', () => deleteServer());
  document.getElementById('leave-server-btn').addEventListener('click', () => leaveServer());

  // Add server

  document.querySelector('.add-server').addEventListener('click', async () => {
    const name = prompt('New server name:');
    if (!name || !name.trim()) return;

    const result = await apiPost(`/new/server/${enc(name.trim())}`, authBody());
    if (!result.ok) { alert('Could not create server.'); return; }

    const newId = result.data && result.data.data && result.data.data.id;
    const servers = await fetchMyServers();
    renderServerList(servers);

    if (newId) {
      await switchServer(newId);
    } else if (servers.length > 0) {
      await switchServer(servers[servers.length - 1].id);
    }
  });

  // Boot

  if (session) {
    await initApp();
  } else {
    showLogin();
  }
});

async function initApp() {
  const check = await apiPost('/get/manifest', authBody());
  if (!check.ok) {
    clearSession();
    location.reload();
    return;
  }

  updateUserUI();
  profilePicCache.set(session.username, session.profilePic || null);
  startSessionCheck();

  const d = check.data.data || {};
  const servers = await fetchMyServers({ servers: d.servers || [], serverOrder: d.serverOrder || [] });
  renderServerList(servers);

  document.querySelector('.server-name').textContent = 'Neutrino';
  document.getElementById('channel-list').innerHTML = servers.length > 0
    ? '<div style="padding:16px;color:var(--text-muted);font-size:13px">Select a server.</div>'
    : '<div style="padding:16px;color:var(--text-muted);font-size:13px">No servers yet. Click + to create one.</div>';

  resetChatArea('Select a server and channel');
}

const EMOJI_CATEGORIES = {
  'Smileys': [
    '😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩',
    '😘','😗','😚','😙','🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🫡',
    '🤐','🤨','😐','😑','😶','🫥','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴',
    '😷','🤒','🤕','🤢','🤮','🥵','🥶','🥴','😵','🤯','🤠','🥳','🥸','😎','🤓','🧐',
    '😕','🫤','😟','🙁','☹️','😮','😯','😲','😳','🥺','🥹','😦','😧','😨','😰','😥',
    '😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿',
    '💀','☠️','💩','🤡','👹','👺','👻','👽','👾','🤖'
  ],
  'Gestures': [
    '👋','🤚','🖐️','✋','🖖','🫱','🫲','🫳','🫴','👌','🤌','🤏','✌️','🤞','🫰','🤟',
    '🤘','🤙','👈','👉','👆','🖕','👇','☝️','🫵','👍','👎','✊','👊','🤛','🤜','👏',
    '🙌','🫶','👐','🤲','🤝','🙏','✍️','💅','🤳','💪','🦾','🦿','🦵','🦶','👂','🦻',
    '👃','👣','🫀','🫁','🧠','🦷','🦴','👀','👁️','👅','👄','🫦'
  ],
  'People': [
    '👶','🧒','👦','👧','🧑','👱','👨','🧔','👩','🧓','👴','👵','🙍','🙎','🙅','🙆',
    '💁','🙋','🧏','🙇','🤦','🤷','👮','🕵️','💂','🥷','👷','🫅','🤴','👸','👳','👲',
    '🧕','🤵','👰','🤰','🫃','🫄','🤱','👼','🎅','🤶','🦸','🦹','🧙','🧚','🧛','🧜',
    '🧝','🧞','🧟','🧌','💆','💇','🚶','🧍','🧎','🏃','💃','🕺','🕴️','👯','🧖','🧗',
    '🤸','⛹️','🏋️','🚴','🚵','🤼','🤽','🤾','🤺','⛷️','🏂','🏌️','🏇','🏊','🤹','🧘'
  ],
  'Animals': [
    '🐵','🐒','🦍','🦧','🐶','🐕','🦮','🐩','🐺','🦊','🦝','🐱','🐈','🦁','🐯','🐅',
    '🐆','🐴','🫎','🫏','🐎','🦄','🦓','🦌','🦬','🐮','🐂','🐃','🐄','🐷','🐖','🐗',
    '🐽','🐏','🐑','🐐','🐪','🐫','🦙','🦒','🐘','🦣','🦏','🦛','🐭','🐁','🐀','🐹',
    '🐰','🐇','🐿️','🦫','🦔','🦇','🐻','🐨','🐼','🦥','🦦','🦨','🦘','🦡','🐾','🦃',
    '🐔','🐓','🐣','🐤','🐥','🐦','🐧','🕊️','🦅','🦆','🦢','🦉','🦤','🪶','🦩','🦚',
    '🦜','🪽','🐸','🐊','🐢','🦎','🐍','🐲','🐉','🦕','🦖','🐳','🐋','🐬','🦭','🐟',
    '🐠','🐡','🦈','🐙','🐚','🪸','🐌','🦋','🐛','🐜','🐝','🪲','🐞','🦗','🪳','🕷️',
    '🕸️','🦂','🦟','🪰','🪱','🦠'
  ],
  'Nature': [
    '💐','🌸','💮','🪷','🏵️','🌹','🥀','🌺','🌻','🌼','🌷','🪻','🌱','🪴','🌲','🌳',
    '🌴','🌵','🌾','🌿','☘️','🍀','🍁','🍂','🍃','🪹','🪺','🍄','🌰','🦀','🦞','🦐',
    '🦑','🌍','🌎','🌏','🌐','🪨','🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘','🌙','🌚',
    '🌛','🌜','☀️','🌝','🌞','🪐','⭐','🌟','🌠','🌌','☁️','⛅','⛈️','🌤️','🌥️','🌦️',
    '🌧️','🌨️','🌩️','🌪️','🌫️','🌬️','🌀','🌈','🌂','☂️','☔','⛱️','⚡','❄️','☃️','⛄',
    '☄️','🔥','💧','🌊'
  ],
  'Food': [
    '🍇','🍈','🍉','🍊','🍋','🍌','🍍','🥭','🍎','🍏','🍐','🍑','🍒','🍓','🫐','🥝',
    '🍅','🫒','🥥','🥑','🍆','🥔','🥕','🌽','🌶️','🫑','🥒','🥬','🥦','🧄','🧅','🥜',
    '🫘','🌰','🫚','🫛','🍞','🥐','🥖','🫓','🥨','🥯','🥞','🧇','🧀','🍖','🍗','🥩',
    '🥓','🍔','🍟','🍕','🌭','🥪','🌮','🌯','🫔','🥙','🧆','🥚','🍳','🥘','🍲','🫕',
    '🥣','🥗','🍿','🧈','🧂','🥫','🍱','🍘','🍙','🍚','🍛','🍜','🍝','🍠','🍢','🍣',
    '🍤','🍥','🥮','🍡','🥟','🥠','🥡','🦀','🦞','🦐','🦑','🦪','🍦','🍧','🍨','🍩',
    '🍪','🎂','🍰','🧁','🥧','🍫','🍬','🍭','🍮','🍯','🍼','🥛','☕','🫖','🍵','🍶',
    '🍾','🍷','🍸','🍹','🍺','🍻','🥂','🥃','🫗','🥤','🧋','🧃','🧉','🧊'
  ],
  'Activities': [
    '⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱','🪀','🏓','🏸','🏒','🏑','🥍',
    '🏏','🪃','🥅','⛳','🪁','🏹','🎣','🤿','🥊','🥋','🎽','🛹','🛼','🛷','⛸️','🥌',
    '🎿','⛷️','🏂','🪂','🏋️','🤼','🤸','⛹️','🤺','🤾','🏌️','🏇','🧘','🏄','🏊','🤽',
    '🚣','🧗','🚴','🚵','🎖️','🏆','🥇','🥈','🥉','🏅','🎪','🤹','🎭','🎨','🎬','🎤',
    '🎧','🎼','🎹','🥁','🪘','🎷','🎺','🪗','🎸','🪕','🎻','🪈','🎲','♟️','🎯','🎳',
    '🎮','🕹️','🧩','🪩'
  ],
  'Travel': [
    '🚗','🚕','🚙','🚌','🚎','🏎️','🚓','🚑','🚒','🚐','🛻','🚚','🚛','🚜','🏍️','🛵',
    '🦽','🦼','🛺','🚲','🛴','🛹','🛼','🚏','🛤️','⛽','🛞','🚨','🚥','🚦','🛑','🚧',
    '⚓','🛟','⛵','🛶','🚤','🛳️','⛴️','🛥️','🚢','✈️','🛩️','🛫','🛬','🪂','💺','🚁',
    '🚟','🚠','🚡','🛰️','🚀','🛸','🎆','🎇','🎑','🗾','🏔️','⛰️','🌋','🗻','🏕️','🏖️',
    '🏜️','🏝️','🏞️','🏟️','🏛️','🏗️','🧱','🪨','🪵','🛖','🏘️','🏚️','🏠','🏡','🏢','🏣',
    '🏤','🏥','🏦','🏨','🏩','🏪','🏫','🏬','🏭','🏯','🏰','💒','🗼','🗽','⛪','🕌',
    '🛕','🕍','⛩️','🕋','⛲','⛺','🌁','🌃','🏙️','🌄','🌅','🌆','🌇','🌉','🎠','🛝',
    '🎡','🎢','💈','🎪','🗺️','🧭','🏔️'
  ],
  'Objects': [
    '⌚','📱','📲','💻','⌨️','🖥️','🖨️','🖱️','🖲️','🕹️','🗜️','💾','💿','📀','📼','📷',
    '📸','📹','🎥','📽️','🎞️','📞','☎️','📟','📠','📺','📻','🎙️','🎚️','🎛️','🧭','⏱️',
    '⏲️','⏰','🕰️','⌛','⏳','📡','🔋','🪫','🔌','💡','🔦','🕯️','🪔','🧯','🛢️','💸',
    '💵','💴','💶','💷','🪙','💰','💳','💎','⚖️','🪜','🧰','🪛','🔧','🔨','⚒️','🛠️',
    '⛏️','🪚','🔩','⚙️','🪤','🧱','⛓️','🧲','🔫','💣','🧨','🪓','🔪','🗡️','⚔️','🛡️',
    '🚬','⚰️','🪦','⚱️','🏺','🔮','📿','🧿','🪬','💈','⚗️','🔭','🔬','🕳️','🩹','🩺',
    '🩻','🩼','💊','💉','🩸','🧬','🦠','🧫','🧪','🌡️','🧹','🪠','🧺','🧻','🚽','🚰',
    '🚿','🛁','🛀','🧼','🪥','🪒','🧽','🪣','🧴','🛎️','🔑','🗝️','🚪','🪑','🛋️','🛏️',
    '🛌','🧸','🪆','🖼️','🪞','🪟','🛍️','🛒','🎁','🎈','🎏','🎀','🪄','🪅','🎊','🎉',
    '🎎','🏮','🎐','🧧','✉️','📩','📨','📧','💌','📥','📤','📦','🏷️','🪧','📪','📫',
    '📬','📭','📮','📯','📜','📃','📄','📑','🧾','📊','📈','📉','🗒️','🗓️','📆','📅',
    '🗑️','📇','🗃️','🗳️','🗄️','📋','📁','📂','🗂️','🗞️','📰','📓','📔','📒','📕','📗',
    '📘','📙','📚','📖','🔖','🧷','🔗','📎','🖇️','📐','📏','🧮','📌','📍','✂️','🖊️',
    '🖋️','✒️','🖌️','🖍️','📝','✏️','🔍','🔎','🔏','🔐','🔒','🔓'
  ],
  'Symbols': [
    '❤️','🩷','🧡','💛','💚','💙','🩵','💜','🖤','🩶','🤍','🤎','💔','❤️‍🔥','❤️‍🩹','❣️',
    '💕','💞','💓','💗','💖','💘','💝','💟','☮️','✝️','☪️','🕉️','☸️','✡️','🔯','🕎',
    '☯️','☦️','🛐','⛎','♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓',
    '🆔','⚛️','🉑','☢️','☣️','📴','📳','🈶','🈚','🈸','🈺','🈷️','✴️','🆚','💮','🉐',
    '㊙️','㊗️','🈴','🈵','🈹','🈲','🅰️','🅱️','🆎','🆑','🅾️','🆘','❌','⭕','🛑','⛔',
    '📛','🚫','💯','💢','♨️','🚷','🚯','🚳','🚱','🔞','📵','🚭','❗','❕','❓','❔',
    '‼️','⁉️','🔅','🔆','〽️','⚠️','🚸','🔱','⚜️','🔰','♻️','✅','🈯','💹','❇️','✳️',
    '❎','🌐','💠','Ⓜ️','🌀','💤','🏧','🚾','♿','🅿️','🛗','🈳','🈂️','🛂','🛃','🛄',
    '🛅','🚹','🚺','🚻','🚼','🚮','🎦','📶','🈁','🔣','ℹ️','🔤','🔡','🔠','🆖','🆗',
    '🆙','🆒','🆕','🆓','0️⃣','1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟','🔢',
    '#️⃣','*️⃣','⏏️','▶️','⏸️','⏯️','⏹️','⏺️','⏭️','⏮️','⏩','⏪','⏫','⏬','◀️','🔼',
    '🔽','➡️','⬅️','⬆️','⬇️','↗️','↘️','↙️','↖️','↕️','↔️','↩️','↪️','⤴️','⤵️','🔀',
    '🔁','🔂','🔄','🔃','🎵','🎶','➕','➖','➗','✖️','🟰','♾️','💲','💱','™️','©️',
    '®️','〰️','➰','➿','🔚','🔙','🔛','🔝','🔜','✔️','☑️','🔘','🔴','🟠','🟡','🟢',
    '🔵','🟣','⚫','⚪','🟤','🔺','🔻','🔸','🔹','🔶','🔷','🔳','🔲','▪️','▫️','◾',
    '◽','◼️','◻️','🟥','🟧','🟨','🟩','🟦','🟪','⬛','⬜','🟫','🔈','🔇','🔉','🔊',
    '🔔','🔕','📣','📢','👁️‍🗨️','💬','💭','🗯️','♠️','♣️','♥️','♦️','🃏','🎴','🀄','🕐',
    '🕑','🕒','🕓','🕔','🕕','🕖','🕗','🕘','🕙','🕚','🕛'
  ],
  'Flags': [
    '🏁','🚩','🎌','🏴','🏳️','🏳️‍🌈','🏳️‍⚧️','🏴‍☠️','🇦🇨','🇦🇩','🇦🇪','🇦🇫','🇦🇬','🇦🇮','🇦🇱','🇦🇲',
    '🇦🇴','🇦🇶','🇦🇷','🇦🇸','🇦🇹','🇦🇺','🇦🇼','🇦🇽','🇦🇿','🇧🇦','🇧🇧','🇧🇩','🇧🇪','🇧🇫','🇧🇬','🇧🇭',
    '🇧🇮','🇧🇯','🇧🇱','🇧🇲','🇧🇳','🇧🇴','🇧🇶','🇧🇷','🇧🇸','🇧🇹','🇧🇻','🇧🇼','🇧🇾','🇧🇿','🇨🇦','🇨🇨',
    '🇨🇩','🇨🇫','🇨🇬','🇨🇭','🇨🇮','🇨🇰','🇨🇱','🇨🇲','🇨🇳','🇨🇴','🇨🇵','🇨🇷','🇨🇺','🇨🇻','🇨🇼','🇨🇽',
    '🇨🇾','🇨🇿','🇩🇪','🇩🇬','🇩🇯','🇩🇰','🇩🇲','🇩🇴','🇩🇿','🇪🇦','🇪🇨','🇪🇪','🇪🇬','🇪🇭','🇪🇷','🇪🇸',
    '🇪🇹','🇪🇺','🇫🇮','🇫🇯','🇫🇰','🇫🇲','🇫🇴','🇫🇷','🇬🇦','🇬🇧','🇬🇩','🇬🇪','🇬🇫','🇬🇬','🇬🇭','🇬🇮',
    '🇬🇱','🇬🇲','🇬🇳','🇬🇵','🇬🇶','🇬🇷','🇬🇸','🇬🇹','🇬🇺','🇬🇼','🇬🇾','🇭🇰','🇭🇲','🇭🇳','🇭🇷','🇭🇹',
    '🇭🇺','🇮🇨','🇮🇩','🇮🇪','🇮🇱','🇮🇲','🇮🇳','🇮🇴','🇮🇶','🇮🇷','🇮🇸','🇮🇹','🇯🇪','🇯🇲','🇯🇴','🇯🇵',
    '🇰🇪','🇰🇬','🇰🇭','🇰🇮','🇰🇲','🇰🇳','🇰🇵','🇰🇷','🇰🇼','🇰🇾','🇰🇿','🇱🇦','🇱🇧','🇱🇨','🇱🇮','🇱🇰',
    '🇱🇷','🇱🇸','🇱🇹','🇱🇺','🇱🇻','🇱🇾','🇲🇦','🇲🇨','🇲🇩','🇲🇪','🇲🇫','🇲🇬','🇲🇭','🇲🇰','🇲🇱','🇲🇲',
    '🇲🇳','🇲🇴','🇲🇵','🇲🇶','🇲🇷','🇲🇸','🇲🇹','🇲🇺','🇲🇻','🇲🇼','🇲🇽','🇲🇾','🇲🇿','🇳🇦','🇳🇨','🇳🇪',
    '🇳🇫','🇳🇬','🇳🇮','🇳🇱','🇳🇴','🇳🇵','🇳🇷','🇳🇺','🇳🇿','🇴🇲','🇵🇦','🇵🇪','🇵🇫','🇵🇬','🇵🇭','🇵🇰',
    '🇵🇱','🇵🇲','🇵🇳','🇵🇷','🇵🇸','🇵🇹','🇵🇼','🇵🇾','🇶🇦','🇷🇪','🇷🇴','🇷🇸','🇷🇺','🇷🇼','🇸🇦','🇸🇧',
    '🇸🇨','🇸🇩','🇸🇪','🇸🇬','🇸🇭','🇸🇮','🇸🇯','🇸🇰','🇸🇱','🇸🇲','🇸🇳','🇸🇴','🇸🇷','🇸🇸','🇸🇹','🇸🇻',
    '🇸🇽','🇸🇾','🇸🇿','🇹🇦','🇹🇨','🇹🇩','🇹🇫','🇹🇬','🇹🇭','🇹🇯','🇹🇰','🇹🇱','🇹🇲','🇹🇳','🇹🇴','🇹🇷',
    '🇹🇹','🇹🇻','🇹🇼','🇹🇿','🇺🇦','🇺🇬','🇺🇲','🇺🇳','🇺🇸','🇺🇾','🇺🇿','🇻🇦','🇻🇨','🇻🇪','🇻🇬','🇻🇮',
    '🇻🇳','🇻🇺','🇼🇫','🇼🇸','🇽🇰','🇾🇪','🇾🇹','🇿🇦','🇿🇲','🇿🇼'
  ]
};


function enc(s) { return encodeURIComponent(s); }

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function tokenToHex(token) {
  return token.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Toast notifications
let pendingToasts = [];

function showToast(message, type = 'error', delay = 0) {
  if (delay > 0) {
    const entry = { message, cancelled: false };
    const timer = setTimeout(() => {
      pendingToasts = pendingToasts.filter(e => e !== entry);
      if (!entry.cancelled) _showToast(message, type);
    }, delay);
    entry.timer = timer;
    pendingToasts.push(entry);
    return;
  }
  _showToast(message, type);
}

function suppressToast(message) {
  for (const entry of pendingToasts) {
    if (entry.message === message) {
      entry.cancelled = true;
      clearTimeout(entry.timer);
    }
  }
  pendingToasts = pendingToasts.filter(e => !e.cancelled);
}

function _showToast(message, type = 'error') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast' + (type === 'success' ? ' success' : '');
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => { if (toast.parentNode) toast.remove(); }, 6000);
  toast.addEventListener('click', () => toast.remove());
}

// Custom prompt modal — async replacement for window.prompt().
// Options: { defaultValue, password }
function showPrompt(message, opts = {}) {
  return new Promise(resolve => {
    const overlay = document.getElementById('prompt-overlay');
    const msgEl = document.getElementById('prompt-message');
    const input = document.getElementById('prompt-input');
    const okBtn = document.getElementById('prompt-ok');
    const cancelBtn = document.getElementById('prompt-cancel');

    msgEl.textContent = message;
    input.type = opts.password ? 'password' : 'text';
    input.value = opts.defaultValue || '';
    input.style.display = opts.confirm ? 'none' : '';
    overlay.classList.add('open');
    if (opts.confirm) okBtn.focus(); else input.focus();

    function cleanup() {
      overlay.classList.remove('open');
      input.style.display = '';
      okBtn.removeEventListener('click', onOk);
      cancelBtn.removeEventListener('click', onCancel);
      overlay.removeEventListener('keydown', onKey);
    }
    function onOk() { cleanup(); resolve(opts.confirm ? true : input.value); }
    function onCancel() { cleanup(); resolve(opts.confirm ? false : null); }
    function onKey(e) {
      if (e.key === 'Enter') onOk();
      else if (e.key === 'Escape') onCancel();
    }

    okBtn.addEventListener('click', onOk);
    cancelBtn.addEventListener('click', onCancel);
    overlay.addEventListener('keydown', onKey);
  });
}

function showConfirm(message) {
  return showPrompt(message, { confirm: true });
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
  profilePicCache.clear();
  serverThumbnailCache.clear();
  lastReadIds.clear();
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

    if (!res.ok && data && data.hasUserMessage) {
      showToast(data.userMessage, 'error', 100);
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

    if (!res.ok && data && data.hasUserMessage) {
      showToast(data.userMessage, 'error', 100);
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
let replyingTo         = null; // { id, from, content }

const collapsedCategories = new Set();
const lastReadIds         = loadLastReadIds();

function loadLastReadIds() {
  try {
    const raw = localStorage.getItem('neutrino-lastReadIds');
    if (raw) return new Map(JSON.parse(raw));
  } catch {}
  return new Map();
}

function saveLastReadIds() {
  localStorage.setItem('neutrino-lastReadIds', JSON.stringify([...lastReadIds]));
}

const hiddenDMs = loadHiddenDMs();

function loadHiddenDMs() {
  try {
    const raw = localStorage.getItem('neutrino-hiddenDMs');
    if (raw) return new Map(JSON.parse(raw));
  } catch {}
  return new Map();
}

function saveHiddenDMs() {
  localStorage.setItem('neutrino-hiddenDMs', JSON.stringify([...hiddenDMs]));
}

function isDMHidden(dm) {
  const hiddenAt = hiddenDMs.get(dm.channel);
  if (hiddenAt == null) return false;
  // Unhide if there's a newer message from the other user
  return dm.timestamp == null || dm.timestamp <= hiddenAt;
}

function saveNavState(state) {
  localStorage.setItem('neutrino-navState', JSON.stringify(state));
}

function loadNavState() {
  try {
    const raw = localStorage.getItem('neutrino-navState');
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function clearNavState() {
  localStorage.removeItem('neutrino-navState');
}

window.disableNavRestore = function() { localStorage.removeItem('neutrino-navState'); localStorage.setItem('neutrino-skipNavRestore', '1'); };
const drafts = loadDrafts();

function loadDrafts() {
  try {
    const raw = localStorage.getItem('neutrino-drafts');
    if (raw) return new Map(JSON.parse(raw));
  } catch {}
  return new Map();
}

function saveDrafts() {
  if (drafts.size === 0) {
    localStorage.removeItem('neutrino-drafts');
  } else {
    localStorage.setItem('neutrino-drafts', JSON.stringify([...drafts]));
  }
}

let pollTimer         = null;
let sessionCheckTimer = null;
let exploreOpen       = false;
let dmOpen            = false;
let dmListPollTimer   = null;
let notificationsActive = false;
let dmNotifTimer      = null;
let lastDMCheck       = new Map(); // channelName -> { timestamp, preview }


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
  if (!ok) return null;
  const d = data.data || {};
  return { messages: d.messages || [], members: d.members || [], reactionUpdates: d.reactionUpdates || [] };
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

  const hasMemberField = servers.length > 0 && 'member' in servers[0];
  const mine = hasMemberField ? servers.filter(s => s.member) : servers;
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

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    if (data && data.hasUserMessage) showToast(data.userMessage);
    return false;
  }

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

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    if (data && data.hasUserMessage) showToast(data.userMessage);
    return false;
  }

  return true;
}

async function logout() {
  stopPolling();
  stopSessionCheck();
  stopDMNotifPoll();
  if (session) await apiPost('/close/session', authBody());
  clearSession();
  clearNavState();
  location.reload();
}


// --- Text formatting ---

function formatTime(ts) {
  const d = ts ? new Date(ts) : new Date();
  const now = new Date();
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  const time = `${h}:${m} ${ampm}`;

  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  if (isToday) return `Today at ${time}`;
  if (isYesterday) return `Yesterday at ${time}`;
  return `${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getDate().toString().padStart(2,'0')}/${d.getFullYear()} ${time}`;
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

const REACT_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>';

const REPLY_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 00-4-4H4"/></svg>';

const VIDEO_ICON = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>';

function avatarHTML(name, picId) {
  const inner = picId
    ? `<img src="/media/${enc(picId)}" alt="${esc(name)}">`
    : esc(name[0]).toUpperCase();
  const bg = picId ? 'transparent' : 'var(--brand-color)';
  return { inner, bg };
}

function buildAttachmentsHTML(attachments) {
  if (!attachments || attachments.length === 0) return '';

  const items = attachments.map(a => {
    const safeId = enc(a.id);
    if (a.mimeType && a.mimeType.startsWith('image/')) {
      return `<img class="message-img" src="/media/${safeId}" alt="image" loading="lazy" data-media-id="${esc(a.id)}">`;
    }
    if (a.mimeType && a.mimeType.startsWith('video/')) {
      return `<video class="message-video" src="/media/${safeId}" controls></video>`;
    }
    return '';
  }).filter(Boolean).join('');

  return items ? `<div class="message-attachments">${items}</div>` : '';
}

function buildReplyInlineHTML(replyTo) {
  if (!replyTo) return '';
  const preview = esc(replyTo.content).substring(0, 100);
  return `<span class="reply-inline" data-reply-id="${replyTo.id}"><span class="reply-inline-icon">${REPLY_ICON}</span> <span class="reply-author">${esc(replyTo.from)}</span> <span class="reply-preview">${preview}</span></span>`;
}

function buildMessageHTML(msgs) {
  return msgs.map((msg, i) => {
    const prev = i > 0 ? msgs[i - 1] : null;
    const isGroupStart = !prev || prev.from !== msg.from || !!msg.replyTo;
    const { inner, bg } = avatarHTML(msg.from, profilePicCache.get(msg.from));
    const canDelete = session && (msg.from === session.username || currentServerOwner === session.username);
    const canEdit   = session && msg.from === session.username;

    const hasActions = canDelete || canEdit || !!session;

    return `
      <div class="message ${isGroupStart ? 'message-group-start' : ''}" data-msg-id="${msg.id}">
        <div class="message-avatar ${isGroupStart ? '' : 'hidden'}" style="background:${bg}">
          ${inner}
        </div>
        <div class="message-content">
          ${isGroupStart ? `
            <div class="message-header">
              <span class="message-author">${esc(msg.from)}</span>
              <span class="message-timestamp">${msg.time}</span>
              ${buildReplyInlineHTML(msg.replyTo)}
            </div>` : ''}
          <div class="message-text" data-msg-id="${msg.id}">${formatText(msg.content)}</div>
          ${buildAttachmentsHTML(msg.attachments)}
          ${buildReactionsHTML(msg.reactions, msg.id)}
        </div>
        ${hasActions ? `<div class="message-actions">
          ${session ? `<button class="msg-action-btn msg-reply-btn" data-msg-id="${msg.id}" title="Reply">${REPLY_ICON}</button>` : ''}
          ${session ? `<button class="msg-action-btn msg-react-btn" data-msg-id="${msg.id}" title="React">${REACT_ICON}</button>` : ''}
          ${canEdit ? `<button class="msg-action-btn msg-edit-btn" data-msg-id="${msg.id}" title="Edit message">${EDIT_ICON}</button>` : ''}
          ${canDelete ? `<button class="msg-action-btn msg-delete-btn" data-msg-id="${msg.id}" title="Delete message">${DELETE_ICON}</button>` : ''}
        </div>` : ''}
      </div>`;
  }).join('');
}


// --- Message rendering ---

function toDisplayMessage(m) {
  return { from: m.from, content: m.content, id: m.id, time: formatTime(m.timestamp), attachments: m.attachments || [], reactions: m.reactions || [], replyTo: m.replyTo || null };
}

function renderMessages(history) {
  renderedMessages = [...history].reverse().map(toDisplayMessage);
  rebuildDOM();
}

function rebuildDOM() {
  const container = document.getElementById('messages-container');
  const atBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 80;

  // Preserve any in-progress edit so polling doesn't destroy it
  let activeEdit = null;
  const editInput = container.querySelector('.edit-input');
  if (editInput) {
    const msgEl = editInput.closest('.message');
    if (msgEl) {
      activeEdit = { id: Number(msgEl.dataset.msgId), value: editInput.value };
    }
  }

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

  // Restore edit if the message still exists
  if (activeEdit) {
    const msg = renderedMessages.find(m => m.id === activeEdit.id);
    if (msg) {
      startEditMessage(activeEdit.id);
      const restored = container.querySelector(`.message[data-msg-id="${activeEdit.id}"] .edit-input`);
      if (restored) restored.value = activeEdit.value;
    }
  }
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
    el.setAttribute('role', 'button');
    el.tabIndex = 0;

    const thumb = serverThumbnailCache.get(s.id);
    if (thumb) {
      el.innerHTML = `<img src="/media/${enc(thumb)}" alt="${esc(s.name)}">`;
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

      container.querySelectorAll('.server-icon').forEach(c => c.classList.remove('drag-over'));
      el.classList.add('drag-over');

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
            <button class="rename-cat-btn" data-category="${esc(cat.name)}" title="Rename category">&#9998;</button>
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
          <div class="channel${active}${unread}" data-channel="${esc(name)}" data-category="${esc(cat.name)}" role="button" tabindex="0">
            <span class="channel-hash">#</span>
            <span class="channel-name">${esc(name)}</span>
            ${isOwner ? `
              <div class="channel-actions">
                <button class="rename-channel-btn" data-channel="${esc(name)}" data-category="${esc(cat.name)}" title="Rename channel">&#9998;</button>
                <button class="remove-channel-btn" data-channel="${esc(name)}" data-category="${esc(cat.name)}" title="Delete channel">&#215;</button>
              </div>
            ` : ''}
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
      if (e.target.closest('.add-channel-btn') || e.target.closest('.rename-cat-btn') || e.target.closest('.remove-cat-btn')) return;

      const catName = catEl.dataset.category;
      const channelsDiv = list.querySelector(`.category-channels[data-category="${CSS.escape(catName)}"]`);

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
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      if (await showConfirm(`Delete category "${btn.dataset.category}" and all its channels?`)) {
        removeCategory(btn.dataset.category);
      }
    });
  });

  // Rename category

  list.querySelectorAll('.rename-cat-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      renameCategory(btn.dataset.category);
    });
  });

  // Rename channel

  list.querySelectorAll('.rename-channel-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      renameChannel(btn.dataset.category, btn.dataset.channel);
    });
  });

  // Remove channel

  list.querySelectorAll('.remove-channel-btn').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      if (await showConfirm(`Delete channel #${btn.dataset.channel}?`)) {
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
  const name = await showPrompt('Category name:');
  if (!name || !name.trim()) return;

  const { ok } = await apiPost(`/new/category/${enc(currentServer)}/${enc(name.trim())}`, authBody());
  if (!ok) return;

  const data = await fetchServerData(currentServer);
  renderChannelSidebar(data);
}

async function promptCreateChannel(categoryName) {
  const name = await showPrompt(`Channel name (in ${categoryName}):`);
  if (!name || !name.trim()) return;

  const { ok } = await apiPost(
    `/new/channel/${enc(currentServer)}/${enc(categoryName)}/${enc(name.trim())}`,
    authBody()
  );
  if (!ok) return;

  const data = await fetchServerData(currentServer);
  renderChannelSidebar(data);
}

async function removeCategory(categoryName) {
  const { ok } = await apiPost(`/remove/category/${enc(currentServer)}/${enc(categoryName)}`, authBody());
  if (!ok) return;

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
  if (!ok) return;

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

async function renameServer() {
  if (!currentServer) return;

  const name = await showPrompt('New server name:', { defaultValue: currentServerName || '' });
  if (!name || !name.trim() || name.trim() === currentServerName) return;

  const { ok } = await apiPost(
    `/edit/server/${enc(currentServer)}/${enc(name.trim())}`,
    authBody()
  );
  if (!ok) return;

  currentServerName = name.trim();
  document.querySelector('.server-name').textContent = currentServerName;

  const icon = document.querySelector(`.server-icon[data-server="${CSS.escape(currentServer)}"]`);
  if (icon) {
    icon.title = currentServerName;
    if (!serverThumbnailCache.get(currentServer)) {
      icon.textContent = currentServerName[0].toUpperCase();
    }
  }
}

async function renameCategory(categoryName) {
  const name = await showPrompt('New category name:', { defaultValue: categoryName });
  if (!name || !name.trim() || name.trim() === categoryName) return;

  const { ok } = await apiPost(
    `/edit/category/${enc(currentServer)}/${enc(categoryName)}/${enc(name.trim())}`,
    authBody()
  );
  if (!ok) return;

  if (currentCategory === categoryName) {
    currentCategory = name.trim();
  }

  const data = await fetchServerData(currentServer);
  renderChannelSidebar(data);
}

async function renameChannel(categoryName, channelName) {
  const name = await showPrompt('New channel name:', { defaultValue: channelName });
  if (!name || !name.trim() || name.trim() === channelName) return;

  const { ok } = await apiPost(
    `/edit/channel/${enc(currentServer)}/${enc(categoryName)}/${enc(channelName)}/${enc(name.trim())}`,
    authBody()
  );
  if (!ok) return;

  if (currentChannel === channelName && currentCategory === categoryName) {
    currentChannel = name.trim();
    document.getElementById('channel-topic').textContent = `#${currentChannel}`;
    document.getElementById('message-input').placeholder = `Message #${currentChannel}`;
  }

  const data = await fetchServerData(currentServer);
  renderChannelSidebar(data);
}

async function deleteServer() {
  if (!currentServer) return;
  if (!await showConfirm(`Delete server "${currentServerName || currentServer}"? This cannot be undone.`)) return;

  const { ok } = await apiPost(`/remove/server/${enc(currentServer)}`, authBody());
  if (!ok) return;

  await recoverFromServerLoss();
}

async function leaveServer() {
  if (!currentServer) return;
  if (!await showConfirm(`Leave server "${currentServerName || currentServer}"?`)) return;

  const { ok } = await apiPost(`/leave/server/${enc(currentServer)}`, authBody());
  if (!ok) return;

  await recoverFromServerLoss();
}

async function deleteMessage(msgId) {
  const { ok } = await apiPost(
    `/remove/message/${enc(currentServer)}/${enc(currentCategory)}/${enc(currentChannel)}/${msgId}`,
    authBody()
  );
  if (!ok) return;

  renderedMessages = renderedMessages.filter(m => m.id !== msgId);
  if (lastSeenId === msgId) {
    const newest = renderedMessages.length > 0 ? renderedMessages[renderedMessages.length - 1] : null;
    lastSeenId = newest ? newest.id : -1;
  }
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


// --- Reactions ---

function buildReactionsHTML(reactions, msgId) {
  if (!reactions || reactions.length === 0) return '';

  // Group by emoji: { emoji: [usernames] }
  const groups = {};
  for (const r of reactions) {
    if (!groups[r.content]) groups[r.content] = [];
    groups[r.content].push(r.from);
  }

  const pills = Object.entries(groups).map(([emoji, users]) => {
    const isMine = session && users.includes(session.username);
    const title = users.map(u => esc(u)).join(', ');
    return `<button class="reaction-pill${isMine ? ' mine' : ''}" data-msg-id="${msgId}" data-emoji="${esc(emoji)}" title="${title}">${emoji} ${users.length}</button>`;
  }).join('');

  return `<div class="reactions-row">${pills}</div>`;
}

async function reactToMessage(msgId, emoji) {
  const { ok } = await apiPost(
    `/new/reaction/${enc(currentServer)}/${enc(currentCategory)}/${enc(currentChannel)}/${msgId}`,
    authBody({ content: emoji })
  );
  if (!ok) return;

  const msg = renderedMessages.find(m => m.id === msgId);
  if (msg) {
    msg.reactions = msg.reactions.filter(r => r.from !== session.username);
    msg.reactions.push({ from: session.username, content: emoji });
    rebuildDOM();
  }
}

async function removeReaction(msgId) {
  const { ok } = await apiPost(
    `/remove/reaction/${enc(currentServer)}/${enc(currentCategory)}/${enc(currentChannel)}/${msgId}`,
    authBody()
  );
  if (!ok) return;

  const msg = renderedMessages.find(m => m.id === msgId);
  if (msg) {
    msg.reactions = msg.reactions.filter(r => r.from !== session.username);
    rebuildDOM();
  }
}

function openReactionPicker(msgId, anchorEl) {
  closeReactionPicker();
  const picker = document.createElement('div');
  picker.className = 'reaction-picker';
  picker.id = 'reaction-picker';
  picker.dataset.msgId = msgId;

  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.className = 'emoji-search';
  searchInput.placeholder = 'Search emojis…';
  searchInput.autocomplete = 'off';
  picker.appendChild(searchInput);

  const gridContainer = document.createElement('div');
  gridContainer.className = 'emoji-grid';
  picker.appendChild(gridContainer);

  const resultsContainer = document.createElement('div');
  resultsContainer.className = 'emoji-search-results';
  picker.appendChild(resultsContainer);

  const onPick = e => {
    trackRecentEmoji(e);
    reactToMessage(msgId, e);
    closeReactionPicker();
  };

  buildEmojiGrid(gridContainer, onPick);

  searchInput.addEventListener('input', () => {
    renderEmojiSearchResults(searchInput.value.trim().toLowerCase(), gridContainer, resultsContainer, onPick);
  });

  anchorEl.closest('.message').appendChild(picker);
  searchInput.focus();
}

function closeReactionPicker() {
  const existing = document.getElementById('reaction-picker');
  if (existing) existing.remove();
}


// --- Reply ---

function startReply(msgId) {
  const msg = renderedMessages.find(m => m.id === msgId);
  if (!msg) return;

  const preview = msg.content.length > 80 ? msg.content.substring(0, 80) + '…' : msg.content;
  replyingTo = { id: msg.id, from: msg.from, content: preview };
  renderReplyBar();
  document.getElementById('message-input').focus();
}

function cancelReply() {
  replyingTo = null;
  renderReplyBar();
}

function renderReplyBar() {
  const strip = document.getElementById('attachment-preview-strip');
  let bar = document.getElementById('reply-bar');

  if (!replyingTo) {
    if (bar) bar.remove();
    return;
  }

  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'reply-bar';
    bar.className = 'reply-bar';
    strip.parentNode.insertBefore(bar, strip);
  }

  bar.innerHTML = `<span class="reply-bar-text">Replying to <strong>${esc(replyingTo.from)}</strong>: ${esc(replyingTo.content)}</span><button class="reply-bar-close" id="reply-bar-close">&times;</button>`;
  document.getElementById('reply-bar-close').addEventListener('click', cancelReply);
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
  }
}

async function inviteToServer() {
  if (!currentServer) return;

  const username = await showPrompt('Username to invite:');
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
  }
}

async function kickFromServer() {
  if (!currentServer) return;

  const kickable = currentServerMembers.filter(m => m !== session.username && m !== currentServerOwner);
  if (kickable.length === 0) { showToast('No members to kick.'); return; }

  const username = await showPrompt('Username to kick:\n\nMembers: ' + kickable.join(', '));
  if (!username || !username.trim()) return;

  if (!kickable.includes(username.trim())) {
    showToast('User is not a kickable member of this server.');
    return;
  }

  if (!await showConfirm(`Kick ${username.trim()} from this server? They will be removed from all channels.`)) return;

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
    if (!result.ok) return;

    const id = result.data.data.id;
    const { ok } = await apiPost(`/edit/profilepic/${id}`, authBody());
    if (!ok) return;

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
    if (!result.ok) return;

    const id = result.data.data.id;
    const { ok } = await apiPost(`/edit/thumbnail/${enc(currentServer)}/${id}`, authBody());
    if (!ok) return;

    serverThumbnailCache.set(currentServer, id);

    const icon = document.querySelector(`.server-icon[data-server="${CSS.escape(currentServer)}"]`);
    if (icon) {
      icon.innerHTML = `<img src="/media/${enc(id)}" alt="${esc(currentServerName || '')}">`;
    }
  };

  input.click();
}

async function handleFilesSelected(files) {
  if (!files || files.length === 0) return;

  for (const file of files) {
    if (pendingAttachments.length >= 10) {
      showToast('Maximum 10 attachments per message.');
      break;
    }

    const result = await apiUpload(file);
    if (!result.ok) continue;

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
  const newName = await showPrompt('New username:');
  if (!newName || !newName.trim()) return;

  const { ok } = await apiPost(`/edit/user/${enc(newName.trim())}`, authBody());
  if (!ok) return;

  session.username = newName.trim();
  saveSession();
  updateUserUI();
}

async function changePassword() {
  const current = await showPrompt('Current password:', { password: true });
  if (!current) return;

  const newPass = await showPrompt('New password:', { password: true });
  if (!newPass) return;

  const { ok } = await apiPost('/edit/password', authBody({ password: current, newPassword: newPass }));
  if (!ok) return;

  showToast('Password changed.', 'success');
}

async function deleteAccount() {
  const password = await showPrompt('Enter your password to permanently delete your account:', { password: true });
  if (!password) return;

  const { ok } = await apiPost('/remove/user', {
    username: session.username,
    token: session.token,
    password,
  });

  if (ok) {
    clearSession();
    location.reload();
  }
}


// --- Navigation ---

async function switchServer(serverId) {
  if (exploreOpen) closeExplore();
  if (dmOpen) closeDMs();
  if (dmChatChannel) closeDMChat();
  closeEmojiPicker();
  stopPolling();

  // Save draft from current channel before switching
  if (currentServer && currentChannel) {
    const prevKey = `${currentServer}/${currentCategory}/${currentChannel}`;
    const prevInput = document.getElementById('message-input');
    if (prevInput.value.trim()) {
      drafts.set(prevKey, prevInput.value);
    } else {
      drafts.delete(prevKey);
    }
    saveDrafts();
  }

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

  document.getElementById('chat-channel-name').textContent = '';
  document.getElementById('channel-topic').textContent = '';
  document.getElementById('message-input').placeholder = 'Select a channel first';
  document.getElementById('message-input').disabled = true;
  document.getElementById('attach-btn').disabled = true;
  document.getElementById('emoji-btn').disabled = true;
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
  let seeded = false;
  for (const cat of serverData.categories || []) {
    for (const ch of cat.channels || []) {
      const key = `${serverId}/${cat.name}/${ch.name}`;
      if (!lastReadIds.has(key)) {
        lastReadIds.set(key, ch.latestMsgId);
        seeded = true;
      }
    }
  }
  if (seeded) saveLastReadIds();

  if (serverData.thumbnail && serverData.thumbnail !== 'none') {
    serverThumbnailCache.set(serverId, serverData.thumbnail);
  }

  const isOwner = session && session.username === serverData.owner;
  document.getElementById('delete-server-btn').style.display = isOwner ? '' : 'none';
  document.getElementById('server-menu-btn').style.display = isOwner ? '' : 'none';
  document.getElementById('leave-server-btn').style.display = isOwner ? 'none' : '';
  document.getElementById('toggle-members').style.display = '';
  document.querySelector('.user-controls').style.display = '';
  updateVisibilityBtn();

  renderChannelSidebar(serverData);

  const first = document.querySelector('.channel[data-channel]');
  if (first) {
    first.click();
  } else {
    saveNavState({ view: 'server', server: serverId });
    renderServerLanding(serverData);
  }
}

async function switchChannel(categoryName, channelName) {
  document.querySelector('.app').classList.remove('mobile-sidebar-open');
  closeEmojiPicker();
  stopPolling();

  pendingAttachments.forEach(a => URL.revokeObjectURL(a.objectURL));
  pendingAttachments = [];
  renderAttachmentPreviews();

  const gen = ++navGeneration;

  // Save draft from previous channel
  if (currentServer && currentChannel) {
    const prevKey = `${currentServer}/${currentCategory}/${currentChannel}`;
    const prevInput = document.getElementById('message-input');
    if (prevInput.value.trim()) {
      drafts.set(prevKey, prevInput.value);
    } else {
      drafts.delete(prevKey);
    }
    saveDrafts();
  }

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
  document.getElementById('channel-topic').textContent = `# ${channelName}`;
  const newKey = `${currentServer}/${categoryName}/${channelName}`;
  document.getElementById('message-input').value = drafts.get(newKey) || '';
  document.getElementById('message-input').placeholder = `Message #${channelName}`;
  document.getElementById('message-input').disabled = false;
  document.getElementById('attach-btn').disabled = false;
  document.getElementById('emoji-btn').disabled = false;

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
  saveLastReadIds();

  saveNavState({ view: 'channel', server: currentServer, category: categoryName, channel: channelName });
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

  // Fire server data and message data requests in parallel
  const serverDataPromise = fetchServerData(currentServer);
  const messagePromise = currentChannel && lastSeenId >= 0
    ? fetchNewMessages(currentServer, currentCategory, currentChannel, lastSeenId)
    : null;

  const serverData = await serverDataPromise;
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
    const icon = document.querySelector(`.server-icon[data-server="${CSS.escape(currentServer)}"]`);

    if (icon) {
      if (newThumb) {
        icon.innerHTML = `<img src="/media/${enc(newThumb)}" alt="${esc(currentServerName || '')}">`;
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
  let seededNew = false;
  for (const cat of serverData.categories || []) {
    for (const ch of cat.channels || []) {
      const key = `${currentServer}/${cat.name}/${ch.name}`;

      if (!lastReadIds.has(key)) {
        lastReadIds.set(key, ch.latestMsgId);
        seededNew = true;
        continue;
      }

      const readId = lastReadIds.get(key);
      if (ch.latestMsgId > readId) {
        if (ch.name === currentChannel && cat.name === currentCategory) {
          lastReadIds.set(key, ch.latestMsgId);
        } else {
          hasUnreadChange = true;
        }
      }
    }
  }
  if (seededNew) saveLastReadIds();

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

  // Await the message fetch that was started in parallel with the server fetch
  const result = await messagePromise;
  if (!session || gen !== navGeneration) return;

  if (result === null) {
    suppressToast("That message doesn't exist.");
    await recoverFromChannelLoss();
    return;
  }

  let needsRebuild = false;

  if (result.messages.length > 0) {
    lastSeenId = result.messages[0].id;
    await ensureProfilePics(result.messages.map(m => m.from));

    const toAdd = [...result.messages].reverse().map(toDisplayMessage);
    renderedMessages.push(...toAdd);
    needsRebuild = true;
  }

  // Sync reactions on existing messages
  for (const update of result.reactionUpdates) {
    const msg = renderedMessages.find(m => m.id === update.id);
    if (!msg) continue;
    const newJson = JSON.stringify(update.reactions);
    if (JSON.stringify(msg.reactions) !== newJson) {
      msg.reactions = update.reactions;
      needsRebuild = true;
    }
  }

  if (needsRebuild) rebuildDOM();

  // Sync channel members (included in the chat-since response)
  if (JSON.stringify(result.members) !== JSON.stringify(currentChannelMembers)) {
    currentChannelMembers = result.members;
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
  document.getElementById('server-menu-btn').style.display = 'none';
  document.getElementById('delete-server-btn').style.display = 'none';
  document.getElementById('leave-server-btn').style.display = 'none';
  resetChatArea('No server selected');
}


// --- Landing pages ---

function resetChatArea(reason) {
  document.getElementById('chat-channel-name').textContent = '';
  document.getElementById('channel-topic').textContent = '';
  document.getElementById('message-input').placeholder = reason;
  document.getElementById('message-input').disabled = true;
  document.getElementById('attach-btn').disabled = true;
  document.getElementById('emoji-btn').disabled = true;
  document.getElementById('messages-container').innerHTML = `
    <div class="welcome-message">
      <div class="welcome-icon">N</div>
      <h1>Neutrino</h1>
      <p>${reason}.</p>
    </div>`;
  document.getElementById('members-sidebar').innerHTML =
    '<div style="display: none" class="member-category"><span>CHANNEL MEMBERS</span></div>';
}

function renderServerLanding(serverData) {
  const name = serverData.name || 'Server';
  const thumb = serverData.thumbnail && serverData.thumbnail !== 'none' ? serverData.thumbnail : null;
  const memberCount = (serverData.members || []).length;

  const iconInner = thumb
    ? `<img src="/media/${enc(thumb)}" alt="${esc(name)}" style="width:64px;height:64px;border-radius:50%;object-fit:cover">`
    : esc(name[0]).toUpperCase();

  document.getElementById('chat-channel-name').textContent = '';
  document.getElementById('channel-topic').textContent = '';
  document.getElementById('message-input').placeholder = 'Select a channel first';
  document.getElementById('message-input').disabled = true;
  document.getElementById('attach-btn').disabled = true;
  document.getElementById('emoji-btn').disabled = true;

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


// --- DMs ---

function formatDMTime(ts) {
  const d = new Date(ts);
  const mon = d.toLocaleDateString('en-US', { month: 'short' });
  const day = d.getDate();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${mon} ${day} <span style="opacity:0.7">@</span> ${hh}<span style="opacity:0.7">:</span>${mm}`;
}

function openDMs() {
  stopPolling();
  closeEmojiPicker();
  closeReactionPicker();
  if (exploreOpen) closeExplore();
  if (dmChatChannel) closeDMChat();
  dmOpen = true;

  document.querySelectorAll('.server-icon[data-server]').forEach(el => el.classList.remove('active'));
  document.getElementById('explore-btn').classList.remove('active');
  document.getElementById('dm-btn').classList.add('active');
  document.getElementById('dm-badge').classList.remove('visible');
  document.querySelector('.app').classList.add('dm-open');
  document.getElementById('dm-panel').classList.add('open');

  saveNavState({ view: 'dms' });
  renderDMList();
  startDMListPoll();
}

function closeDMs() {
  stopDMListPoll();
  dmOpen = false;
  document.getElementById('dm-btn').classList.remove('active');
  document.querySelector('.app').classList.remove('dm-open');
  document.getElementById('dm-panel').classList.remove('open');

  if (currentServer) {
    document.querySelectorAll('.server-icon[data-server]').forEach(el => {
      el.classList.toggle('active', el.dataset.server === currentServer);
    });
  }
}

async function renderDMList() {
  const list = document.getElementById('dm-list');

  const { ok, data } = await apiPost('/get/dms', authBody());
  const dms = (ok ? (data.data || []) : []).filter(dm => !isDMHidden(dm));

  const addBtn = `<button class="dm-add-btn" id="dm-add-btn">+ New Direct Channel</button>`;

  if (dms.length === 0) {
    list.innerHTML = addBtn + '<div class="dm-empty">No conversations yet.</div>';
    document.getElementById('dm-add-btn').addEventListener('click', startNewDM);
    return;
  }

  await ensureProfilePics(dms.map(dm => dm.otherUser));

  list.innerHTML = addBtn + dms.map(dm => {
    const pic = profilePicCache.get(dm.otherUser);
    const avatarInner = pic
      ? `<img src="/media/${enc(pic)}" alt="${esc(dm.otherUser)}">`
      : esc(dm.otherUser[0]).toUpperCase();
    const avatarStyle = pic ? '' : ' style="background:var(--brand-color)"';
    return `
      <div class="dm-card" data-dm-channel="${esc(dm.channel)}" data-dm-user="${esc(dm.otherUser)}">
        <div class="dm-card-avatar"${avatarStyle}>${avatarInner}</div>
        <div class="dm-card-body">
          <span class="dm-card-name">${esc(dm.otherUser)}</span>
          <span class="dm-card-preview">${dm.preview ? esc(dm.preview) : ''}</span>
        </div>
        <span class="dm-card-time">${dm.timestamp ? formatDMTime(dm.timestamp) : ''}</span>
        <button class="dm-delete-btn" title="Delete conversation">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
        </button>
      </div>`;
  }).join('');

  document.getElementById('dm-add-btn').addEventListener('click', startNewDM);

  // Click card to open the DM conversation
  list.querySelectorAll('.dm-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.dm-delete-btn')) return;
      const channel = card.dataset.dmChannel;
      openDMConversation(channel);
    });
  });

  list.querySelectorAll('.dm-delete-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const card = btn.closest('.dm-card');
      const dmUser = card.dataset.dmUser;
      const channel = card.dataset.dmChannel;
      if (!await showConfirm(`Hide conversation with ${dmUser}?`)) return;
      hiddenDMs.set(channel, Date.now());
      saveHiddenDMs();
      showToast('Conversation hidden.', 'success');
      renderDMList();
    });
  });
}

function startDMListPoll() {
  stopDMListPoll();
  dmListPollTimer = setInterval(dmListPoll, 5000);
}

function stopDMListPoll() {
  if (dmListPollTimer) { clearInterval(dmListPollTimer); dmListPollTimer = null; }
}

async function dmListPoll() {
  if (!session || !dmOpen || dmChatChannel) return;
  await renderDMList();
}

// --- DM Chat ---

let dmChatChannel   = null;
let dmChatUser      = null;
let dmChatLastSeen  = -1;
let dmChatMessages  = [];
let dmChatPollTimer = null;

async function openDMConversation(channelName, otherUser) {
  stopDMListPoll();

  // Save draft from previous DM conversation
  if (dmChatChannel) {
    const prevInput = document.getElementById('dm-chat-input');
    if (prevInput.value.trim()) {
      drafts.set(`dm:${dmChatChannel}`, prevInput.value);
    } else {
      drafts.delete(`dm:${dmChatChannel}`);
    }
    saveDrafts();
  }

  const gen = ++navGeneration;

  // If otherUser not provided, try to extract from DM card data
  if (!otherUser) {
    const card = document.querySelector(`.dm-card[data-dm-channel="${CSS.escape(channelName)}"]`);
    otherUser = card ? card.dataset.dmUser : '?';
  }

  dmChatChannel  = channelName;
  dmChatUser     = otherUser;
  dmChatLastSeen = -1;
  dmChatMessages = [];

  await ensureProfilePics([otherUser]);
  if (gen !== navGeneration) return;

  const pic = profilePicCache.get(otherUser);

  const avatarEl = document.getElementById('dm-chat-avatar');
  if (pic) {
    avatarEl.innerHTML = `<img src="/media/${enc(pic)}" alt="${esc(otherUser)}">`;
    avatarEl.style.background = 'transparent';
  } else {
    avatarEl.textContent = (otherUser || '?')[0].toUpperCase();
    avatarEl.style.background = 'var(--brand-color)';
  }

  document.getElementById('dm-chat-username').textContent = otherUser;
  document.getElementById('dm-chat-input').value = drafts.get(`dm:${channelName}`) || '';
  document.getElementById('dm-chat-input').placeholder = `Message ${otherUser}`;
  document.getElementById('dm-chat-overlay').classList.add('open');
  document.querySelector('.app').classList.add('dm-chatting');

  // Load messages
  const data = await fetchChannelData('dm-system', '[SYSTEM] DM Category', channelName);
  if (gen !== navGeneration) return;

  if (!data) {
    closeDMChat();
    return;
  }

  const history = data.history || [];
  const allUsers = [...(data.members || []), ...history.map(m => m.from)];
  await ensureProfilePics(allUsers);
  if (gen !== navGeneration) return;

  dmChatMessages = [...history].reverse().map(toDisplayMessage);
  if (history.length > 0) dmChatLastSeen = history[0].id;

  renderDMChatMessages();
  startDMChatPoll();

  saveNavState({ view: 'dm-chat', channel: channelName, otherUser });
  document.getElementById('dm-chat-input').focus();
}

function renderDMChatMessages() {
  const container = document.getElementById('dm-chat-messages');
  const atBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 80;

  const welcome = `
    <div class="welcome-message">
      <div class="welcome-icon" style="font-size:24px">
        ${profilePicCache.get(dmChatUser)
          ? `<img src="/media/${enc(profilePicCache.get(dmChatUser))}" style="width:48px;height:48px;border-radius:8px;object-fit:cover">`
          : esc(dmChatUser[0]).toUpperCase()}
      </div>
      <h1>${esc(dmChatUser)}</h1>
      <p>This is the beginning of your conversation.</p>
    </div>`;

  container.innerHTML = welcome + buildDMMessageHTML(dmChatMessages);

  if (atBottom) container.scrollTop = container.scrollHeight;
}

function buildDMMessageHTML(msgs) {
  return msgs.map((msg, i) => {
    const prev = i > 0 ? msgs[i - 1] : null;
    const isGroupStart = !prev || prev.from !== msg.from;
    const { inner, bg } = avatarHTML(msg.from, profilePicCache.get(msg.from));
    const canDelete = session && msg.from === session.username;

    return `
      <div class="message ${isGroupStart ? 'message-group-start' : ''}" data-msg-id="${msg.id}">
        <div class="message-avatar ${isGroupStart ? '' : 'hidden'}" style="background:${bg}">
          ${inner}
        </div>
        <div class="message-content">
          ${isGroupStart ? `
            <div class="message-header">
              <span class="message-author">${esc(msg.from)}</span>
              <span class="message-timestamp">${msg.time}</span>
            </div>` : ''}
          <div class="message-text">${formatText(msg.content)}</div>
          ${buildAttachmentsHTML(msg.attachments)}
        </div>
        ${canDelete ? `<div class="message-actions">
          <button class="msg-action-btn msg-delete-btn" data-msg-id="${msg.id}" title="Delete message">${DELETE_ICON}</button>
        </div>` : ''}
      </div>`;
  }).join('');
}

async function closeDMChat() {
  stopDMChatPoll();

  // Save draft before closing
  if (dmChatChannel) {
    const input = document.getElementById('dm-chat-input');
    if (input.value.trim()) {
      drafts.set(`dm:${dmChatChannel}`, input.value);
    } else {
      drafts.delete(`dm:${dmChatChannel}`);
    }
    saveDrafts();
  }

  dmChatChannel = null;
  dmChatUser    = null;
  dmChatLastSeen = -1;
  dmChatMessages = [];
  document.getElementById('dm-chat-overlay').classList.remove('open');
  document.querySelector('.app').classList.remove('dm-chatting');

  if (dmOpen) {
    await renderDMList();
    startDMListPoll();
  }
}

function startDMChatPoll() {
  stopDMChatPoll();
  dmChatPollTimer = setInterval(dmChatPoll, 5000);
}

function stopDMChatPoll() {
  if (dmChatPollTimer) { clearInterval(dmChatPollTimer); dmChatPollTimer = null; }
}

async function dmChatPoll() {
  if (!dmChatChannel || dmChatLastSeen < 0) return;

  const result = await fetchNewMessages('dm-system', '[SYSTEM] DM Category', dmChatChannel, dmChatLastSeen);
  if (!result) {
    suppressToast("That message doesn't exist.");
    // The reference message was likely deleted — reload full history
    const data = await fetchChannelData('dm-system', '[SYSTEM] DM Category', dmChatChannel);
    if (data) {
      const history = data.history || [];
      const allUsers = history.map(m => m.from);
      await ensureProfilePics(allUsers);
      dmChatMessages = [...history].reverse().map(toDisplayMessage);
      dmChatLastSeen = history.length > 0 ? history[0].id : -1;
      renderDMChatMessages();
    }
    return;
  }

  let changed = false;

  // Detect deleted messages: reactionUpdates contains all surviving messages
  // from dmChatLastSeen onward. Any local message whose ID should be in that
  // range but isn't has been deleted.
  if (result.reactionUpdates) {
    const survivingIds = new Set(result.reactionUpdates.map(r => r.id));
    const before = dmChatMessages.length;
    dmChatMessages = dmChatMessages.filter(m => survivingIds.has(m.id));
    if (dmChatMessages.length !== before) changed = true;
  }

  // Add new messages
  if (result.messages && result.messages.length > 0) {
    const allUsers = result.messages.map(m => m.from);
    await ensureProfilePics(allUsers);

    dmChatLastSeen = result.messages[0].id;

    const newMsgs = [...result.messages].reverse().map(toDisplayMessage);
    dmChatMessages = [...dmChatMessages, ...newMsgs];
    changed = true;
  }

  // Update dmChatLastSeen if the previous latest was deleted
  if (dmChatMessages.length > 0) {
    dmChatLastSeen = dmChatMessages[dmChatMessages.length - 1].id;
  } else {
    dmChatLastSeen = -1;
  }

  if (changed) renderDMChatMessages();
}

async function sendDMMessage(text) {
  if (!text.trim() || !dmChatChannel) return;

  if (text.trim().length > 2048) {
    showToast('Message cannot exceed 2048 characters.');
    return;
  }

  const { ok } = await apiPost(
    `/new/message/${enc('dm-system')}/${enc('[SYSTEM] DM Category')}/${enc(dmChatChannel)}`,
    authBody({ content: text.trim(), attachments: [] })
  );

  if (!ok) {
    document.getElementById('dm-chat-input').value = text;
    return;
  }

  if (dmChatChannel) {
    drafts.delete(`dm:${dmChatChannel}`);
    saveDrafts();
  }

  // Poll immediately to show the new message
  if (dmChatLastSeen < 0) {
    const data = await fetchChannelData('dm-system', '[SYSTEM] DM Category', dmChatChannel);
    if (data) {
      const history = data.history || [];
      const allUsers = history.map(m => m.from);
      await ensureProfilePics(allUsers);
      dmChatMessages = [...history].reverse().map(toDisplayMessage);
      if (history.length > 0) dmChatLastSeen = history[0].id;
      renderDMChatMessages();
    }
  } else {
    await dmChatPoll();
  }
}

async function startNewDM() {
  const username = await showPrompt('Username to message:');
  if (!username || !username.trim()) return;

  const { ok, data } = await apiPost(`/new/dm/${enc(username.trim())}`, authBody());
  if (!ok) return;

  const channel = data.data && data.data.channel;
  if (channel) {
    openDMConversation(channel, username.trim());
  }
}


// --- DM Notifications ---

function startDMNotifPoll() {
  stopDMNotifPoll();
  dmNotifTimer = setInterval(checkDMNotifications, 10000);
}

function stopDMNotifPoll() {
  if (dmNotifTimer) { clearInterval(dmNotifTimer); dmNotifTimer = null; }
}

async function checkDMNotifications() {
  if (!session) return;

  const { ok, data } = await apiPost('/get/dms', authBody());
  if (!ok) return;

  const dms = data.data || [];
  let hasUnread = false;

  for (const dm of dms) {
    if (!dm.timestamp || !dm.preview) continue;

    const prev = lastDMCheck.get(dm.channel);
    const isNew = !prev || dm.timestamp > prev.timestamp;

    if (isNew) {
      lastDMCheck.set(dm.channel, { timestamp: dm.timestamp, preview: dm.preview });

      // Skip if we sent the message, or we're viewing this DM right now
      if (dm.previewFrom === session.username) continue;
      if (dmChatChannel === dm.channel) continue;

      hasUnread = true;

      if (notificationsActive) {
        new Notification(dm.otherUser, {
          body: dm.preview,
          tag: `dm-${dm.channel}-${dm.timestamp}`,
        });
      }
    }
  }

  if (hasUnread && (!dmOpen || dmChatChannel)) {
    document.getElementById('dm-badge').classList.add('visible');
  }
}

async function seedDMNotifState() {
  if (!session) return;
  const { ok, data } = await apiPost('/get/dms', authBody());
  if (!ok) return;
  for (const dm of (data.data || [])) {
    if (dm.timestamp) {
      lastDMCheck.set(dm.channel, { timestamp: dm.timestamp, preview: dm.preview });
    }
  }
}


// --- Explore ---

async function openExplore() {
  stopPolling();
  closeEmojiPicker();
  closeReactionPicker();
  if (dmOpen) closeDMs();
  if (dmChatChannel) closeDMChat();
  clearNavState();
  exploreOpen = true;

  document.querySelectorAll('.server-icon[data-server]').forEach(el => el.classList.remove('active'));
  document.getElementById('dm-btn').classList.remove('active');
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
      ? `<img src="/media/${enc(thumb)}" alt="${esc(s.name)}">`
      : esc(s.name[0]).toUpperCase();
    const joined = s.member;

    return `
      <div class="explore-card${joined ? ' joined' : ''}" data-server="${s.id}">
        <div class="explore-card-icon">${iconInner}</div>
        <span class="explore-card-name">${esc(s.name)}</span>
        <span class="explore-card-owner">Owner: ${esc(s.owner)}</span>
        ${joined ? '<span class="explore-card-joined">Joined</span>' : ''}
      </div>`;
  }).join('');

  grid.querySelectorAll('.explore-card:not(.joined)').forEach(card => {
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
    showToast('Message cannot exceed 2048 characters.');
    return;
  }

  // Save state before clearing, so we can restore on failure
  const savedAttachments = [...pendingAttachments];
  const savedReply = replyingTo;

  const attachmentIds = pendingAttachments.map(a => a.id);
  pendingAttachments = [];
  renderAttachmentPreviews();

  const msgBody = { content: text.trim(), attachments: attachmentIds };
  if (replyingTo) {
    msgBody.replyTo = replyingTo.id;
  }
  replyingTo = null;
  renderReplyBar();

  const { ok } = await apiPost(
    `/new/message/${enc(currentServer)}/${enc(currentCategory)}/${enc(currentChannel)}`,
    authBody(msgBody)
  );

  if (!ok) {
    // Restore input state so the user doesn't lose their message
    document.getElementById('message-input').value = text;
    pendingAttachments = savedAttachments;
    renderAttachmentPreviews();
    replyingTo = savedReply;
    renderReplyBar();
    return;
  }

  // Clear draft and revoke object URLs only after confirmed success
  if (currentServer && currentChannel) {
    drafts.delete(`${currentServer}/${currentCategory}/${currentChannel}`);
    saveDrafts();
  }
  savedAttachments.forEach(a => URL.revokeObjectURL(a.objectURL));

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

  // Remember the first previously-visible message to anchor scroll position
  const anchorId = renderedMessages.length > 0 ? renderedMessages[0].id : null;

  renderedMessages = [...older, ...renderedMessages];
  rebuildDOM();

  if (anchorId != null) {
    const anchorEl = document.querySelector(`.message[data-msg-id="${anchorId}"]`);
    if (anchorEl) anchorEl.scrollIntoView({ block: 'start' });
  }
}


// --- UI helpers ---

function updateUserUI() {
  const name = session ? session.username : '?';
  document.getElementById('current-username').textContent = name;

  const av = document.getElementById('user-avatar');
  if (session && session.profilePic) {
    av.innerHTML = `<img src="/media/${enc(session.profilePic)}" alt="${esc(name)}">`;
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
  closeEmojiPickerFull();
}

const EMOJI_NAMES = {
  '😀':'grinning face','😃':'smiley','😄':'smile','😁':'grin','😆':'laughing','😅':'sweat smile','🤣':'rofl rolling','😂':'joy tears laugh','🙂':'slight smile','🙃':'upside down','😉':'wink','😊':'blush','😇':'innocent halo','🥰':'love hearts face','😍':'heart eyes','🤩':'star struck','😘':'kiss blowing','😗':'kiss','😚':'kiss closed eyes','😙':'kiss smiling','🥲':'smile tear','😋':'yum delicious','😛':'tongue out','😜':'wink tongue','🤪':'zany crazy','😝':'squint tongue','🤑':'money mouth','🤗':'hug hugging','🤭':'hand over mouth','🤫':'shush quiet','🤔':'thinking hmm','🫡':'salute','🤐':'zipper mouth','🤨':'raised eyebrow','😐':'neutral','😑':'expressionless','😶':'no mouth silent','🫥':'dotted line face','😏':'smirk','😒':'unamused','🙄':'eye roll','😬':'grimace','🤥':'lying pinocchio','😌':'relieved','😔':'pensive sad','😪':'sleepy','🤤':'drool','😴':'sleeping zzz','😷':'mask sick','🤒':'thermometer sick','🤕':'bandage hurt','🤢':'nauseous','🤮':'vomit puke','🥵':'hot sweating','🥶':'cold freezing','🥴':'woozy drunk','😵':'dizzy','🤯':'exploding head mind blown','🤠':'cowboy','🥳':'party celebrate','🥸':'disguise','😎':'sunglasses cool','🤓':'nerd glasses','🧐':'monocle','😕':'confused','🫤':'diagonal mouth','😟':'worried','🙁':'frown','☹️':'frowning','😮':'open mouth','😯':'hushed','😲':'astonished','😳':'flushed embarrassed','🥺':'pleading puppy eyes','🥹':'holding back tears','😦':'frowning open mouth','😧':'anguished','😨':'fearful scared','😰':'anxious sweat','😥':'sad relieved','😢':'cry crying','😭':'sob crying loud','😱':'scream fear','😖':'confounded','😣':'persevere','😞':'disappointed','😓':'downcast sweat','😩':'weary tired','😫':'tired','🥱':'yawn yawning','😤':'triumph angry','😡':'rage angry red','😠':'angry','🤬':'swearing cursing','😈':'devil smiling','👿':'devil angry imp','💀':'skull dead','☠️':'skull crossbones','💩':'poop poo','🤡':'clown','👹':'ogre','👺':'goblin','👻':'ghost','👽':'alien','👾':'alien monster space invader','🤖':'robot',
  '👋':'wave hello','🤚':'raised back hand','🖐️':'hand fingers splayed','✋':'raised hand stop high five','🖖':'vulcan spock','🫱':'rightward hand','🫲':'leftward hand','🫳':'palm down','🫴':'palm up','👌':'ok okay','🤌':'pinched fingers italian','🤏':'pinching small','✌️':'peace victory','🤞':'crossed fingers luck','🫰':'hand index thumb','🤟':'love you','🤘':'rock metal','🤙':'call me shaka','👈':'point left','👉':'point right','👆':'point up','🖕':'middle finger','👇':'point down','☝️':'index up','🫵':'point at viewer','👍':'thumbs up like','👎':'thumbs down dislike','✊':'fist raised','👊':'fist bump punch','🤛':'left fist bump','🤜':'right fist bump','👏':'clap applause','🙌':'raised hands celebrate','🫶':'heart hands','👐':'open hands','🤲':'palms up','🤝':'handshake deal','🙏':'pray please thanks','✍️':'writing','💅':'nail polish','🤳':'selfie','💪':'flexed bicep strong muscle',
  '🐵':'monkey face','🐶':'dog face','🐱':'cat face','🦁':'lion','🐯':'tiger','🐴':'horse','🦄':'unicorn','🐮':'cow','🐷':'pig','🐰':'rabbit bunny','🐻':'bear','🐼':'panda','🐨':'koala','🐸':'frog','🐔':'chicken','🐧':'penguin','🐦':'bird','🦅':'eagle','🦆':'duck','🦉':'owl','🦇':'bat','🐺':'wolf','🦊':'fox','🐗':'boar','🐍':'snake','🐢':'turtle','🐊':'crocodile','🐘':'elephant','🦒':'giraffe','🐳':'whale','🐬':'dolphin','🐟':'fish','🦈':'shark','🐙':'octopus','🐌':'snail','🦋':'butterfly','🐛':'bug caterpillar','🐜':'ant','🐝':'bee honeybee','🐞':'ladybug','🕷️':'spider','🦂':'scorpion','🦠':'microbe germ',
  '🌸':'cherry blossom','🌹':'rose','🌻':'sunflower','🌷':'tulip','🌲':'evergreen tree','🌴':'palm tree','🌵':'cactus','🍀':'four leaf clover luck','🍁':'maple leaf','🍂':'fallen leaf','🍃':'leaf wind','🌍':'earth globe','🌙':'crescent moon','☀️':'sun sunny','⭐':'star','🌟':'glowing star','🌈':'rainbow','☁️':'cloud','⛅':'partly cloudy','🌧️':'rain cloud','⛈️':'thunder storm','❄️':'snowflake','⚡':'lightning zap','🔥':'fire flame hot lit','💧':'water droplet','🌊':'wave ocean',
  '🍇':'grapes','🍉':'watermelon','🍊':'orange tangerine','🍋':'lemon','🍌':'banana','🍎':'apple red','🍏':'apple green','🍑':'peach','🍒':'cherries','🍓':'strawberry','🥝':'kiwi','🍅':'tomato','🥑':'avocado','🍆':'eggplant','🥕':'carrot','🌽':'corn','🍞':'bread','🧀':'cheese','🍖':'meat bone','🍔':'hamburger burger','🍟':'fries french fries','🍕':'pizza','🌭':'hot dog','🌮':'taco','🌯':'burrito','🥚':'egg','🍳':'cooking egg frying','🍲':'stew pot','🍿':'popcorn','🍱':'bento box','🍣':'sushi','🍦':'ice cream','🍩':'donut doughnut','🍪':'cookie','🎂':'birthday cake','🍫':'chocolate','🍬':'candy','🍭':'lollipop','🍯':'honey','☕':'coffee','🍵':'tea','🍺':'beer','🍻':'cheers beers','🥂':'champagne toast','🍷':'wine',
  '⚽':'soccer football','🏀':'basketball','🏈':'football american','⚾':'baseball','🎾':'tennis','🏐':'volleyball','🏉':'rugby','🎱':'pool billiards','🏓':'ping pong table tennis','🏸':'badminton','🏒':'hockey','⛳':'golf','🏹':'bow arrow archery','🥊':'boxing','🥋':'martial arts','🎽':'running shirt','🛹':'skateboard','🏆':'trophy winner','🥇':'gold medal first','🥈':'silver medal second','🥉':'bronze medal third','🏅':'medal sports','🎪':'circus tent','🎭':'theater performing arts','🎨':'art palette paint','🎬':'movie clapper','🎤':'microphone karaoke','🎧':'headphone music','🎹':'piano keyboard','🥁':'drum','🎷':'saxophone','🎺':'trumpet','🎸':'guitar','🎻':'violin','🎲':'dice game','🎯':'dart target bullseye','🎳':'bowling','🎮':'game controller video game','🕹️':'joystick arcade','🧩':'puzzle piece',
  '🚗':'car automobile','🚕':'taxi cab','🚌':'bus','🏎️':'racing car','🚓':'police car','🚑':'ambulance','🚒':'fire truck','🚚':'delivery truck','🚜':'tractor','🏍️':'motorcycle','🚲':'bicycle bike','🚂':'locomotive train','✈️':'airplane plane','🚀':'rocket space launch','🛸':'ufo flying saucer','🚁':'helicopter','⛵':'sailboat','🚢':'ship','🏠':'house home','🏢':'office building','🏥':'hospital','🏫':'school','🏭':'factory','🏰':'castle','🗽':'statue liberty','⛪':'church','🕌':'mosque','🕍':'synagogue','⛩️':'shinto shrine','🏔️':'mountain snow','🌋':'volcano','🏖️':'beach','🏝️':'island','🎡':'ferris wheel','🎢':'roller coaster',
  '⌚':'watch time','📱':'phone mobile','💻':'laptop computer','⌨️':'keyboard','🖥️':'desktop computer monitor','🖨️':'printer','💾':'floppy disk save','💿':'cd disc','📷':'camera photo','📹':'video camera','🎥':'movie camera film','📺':'television tv','📻':'radio','🎙️':'studio microphone','⏰':'alarm clock','⏳':'hourglass time','💡':'light bulb idea','🔦':'flashlight','🔋':'battery','🔌':'plug electric','💰':'money bag','💳':'credit card','💎':'gem diamond','🔧':'wrench tool','🔨':'hammer','🔩':'nut bolt','⚙️':'gear settings','🔫':'water gun','🔪':'knife','🗡️':'dagger sword','🛡️':'shield','🔮':'crystal ball','💊':'pill medicine','💉':'syringe injection','🔬':'microscope','🔭':'telescope','🚽':'toilet','🚿':'shower','🛁':'bathtub','🔑':'key','🗝️':'old key','🚪':'door','🛋️':'couch sofa','🛏️':'bed','🧸':'teddy bear','🎁':'gift present wrapped','🎈':'balloon','🎉':'party popper celebrate tada','🎊':'confetti','📦':'package box','📫':'mailbox','📝':'memo note writing','📚':'books','📖':'open book','🔗':'link chain','📎':'paperclip','✂️':'scissors','🔒':'lock locked','🔓':'unlocked',
  '❤️':'red heart love','🩷':'pink heart','🧡':'orange heart','💛':'yellow heart','💚':'green heart','💙':'blue heart','🩵':'light blue heart','💜':'purple heart','🖤':'black heart','🩶':'grey heart','🤍':'white heart','🤎':'brown heart','💔':'broken heart','❤️‍🔥':'heart fire','💕':'two hearts','💞':'revolving hearts','💓':'beating heart','💗':'growing heart','💖':'sparkling heart','💘':'heart arrow cupid','💝':'heart ribbon','💟':'heart decoration','💯':'hundred perfect score','💢':'anger','💤':'sleep zzz','💬':'speech bubble chat','💭':'thought bubble','✅':'check mark done','❌':'cross mark wrong','❓':'question mark','❗':'exclamation','⭕':'circle','🚫':'prohibited forbidden no','♻️':'recycle','✨':'sparkles magic','🌀':'cyclone spiral','💠':'diamond blue','🔴':'red circle','🟠':'orange circle','🟡':'yellow circle','🟢':'green circle','🔵':'blue circle','🟣':'purple circle','⚫':'black circle','⚪':'white circle','🔺':'red triangle up','🔻':'red triangle down','🔶':'orange diamond large','🔷':'blue diamond large','▪️':'black square small','▫️':'white square small','🔊':'speaker loud volume','🔔':'bell notification','📣':'megaphone','📢':'loudspeaker','🎵':'music note','🎶':'music notes','➕':'plus add','➖':'minus subtract','➗':'divide','✖️':'multiply','♾️':'infinity'
};

const MAX_RECENT_EMOJIS = 24;

function getRecentEmojis() {
  try {
    return JSON.parse(localStorage.getItem('neutrino-recentEmojis')) || [];
  } catch { return []; }
}

function trackRecentEmoji(emoji) {
  let recent = getRecentEmojis().filter(e => e !== emoji);
  recent.unshift(emoji);
  if (recent.length > MAX_RECENT_EMOJIS) recent = recent.slice(0, MAX_RECENT_EMOJIS);
  localStorage.setItem('neutrino-recentEmojis', JSON.stringify(recent));
}

function searchEmojis(query) {
  const allEmojis = [...new Set([...getRecentEmojis(), ...Object.values(EMOJI_CATEGORIES).flat()])];
  return allEmojis.filter(e => {
    const name = EMOJI_NAMES[e];
    return (name && name.includes(query)) || e === query;
  });
}

function renderEmojiSearchResults(query, gridEl, resultsEl, onPick) {
  if (!query) {
    gridEl.style.display = '';
    resultsEl.style.display = 'none';
    resultsEl.innerHTML = '';
    return;
  }

  gridEl.style.display = 'none';
  resultsEl.style.display = 'grid';
  resultsEl.innerHTML = '';

  const matches = searchEmojis(query);

  if (matches.length === 0) {
    resultsEl.style.display = 'block';
    resultsEl.innerHTML = '<div class="emoji-no-results">No emojis found</div>';
    return;
  }

  matches.forEach(e => {
    const btn = document.createElement('button');
    btn.className = 'emoji-item';
    btn.textContent = e;
    btn.title = EMOJI_NAMES[e] || '';
    btn.addEventListener('click', () => onPick(e));
    resultsEl.appendChild(btn);
  });
}

function buildEmojiGrid(container, onPick, { recentId } = {}) {
  const recent = getRecentEmojis();
  const rid = recentId || ('recent-' + Math.random().toString(36).slice(2));

  if (recent.length > 0) {
    const header = document.createElement('div');
    header.className = 'emoji-category-header';
    header.textContent = 'Recent';
    header.dataset.recentHeader = rid;
    container.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'emoji-category-grid';
    grid.dataset.recentGrid = rid;
    recent.forEach(e => {
      const btn = document.createElement('button');
      btn.className = 'emoji-item';
      btn.textContent = e;
      btn.addEventListener('click', () => onPick(e));
      grid.appendChild(btn);
    });
    container.appendChild(grid);
  }

  for (const [category, emojis] of Object.entries(EMOJI_CATEGORIES)) {
    const header = document.createElement('div');
    header.className = 'emoji-category-header';
    header.textContent = category;
    container.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'emoji-category-grid';
    emojis.forEach(e => {
      const btn = document.createElement('button');
      btn.className = 'emoji-item';
      btn.textContent = e;
      btn.addEventListener('click', () => onPick(e));
      grid.appendChild(btn);
    });
    container.appendChild(grid);
  }

  return rid;
}

function refreshRecentSection(container, rid, onPick) {
  const oldHeader = container.querySelector(`[data-recent-header="${rid}"]`);
  const oldGrid = container.querySelector(`[data-recent-grid="${rid}"]`);
  const recent = getRecentEmojis();

  if (recent.length === 0) {
    if (oldHeader) oldHeader.remove();
    if (oldGrid) oldGrid.remove();
    return;
  }

  let header = oldHeader;
  let grid = oldGrid;

  if (!header) {
    header = document.createElement('div');
    header.className = 'emoji-category-header';
    header.textContent = 'Recent';
    header.dataset.recentHeader = rid;
    grid = document.createElement('div');
    grid.className = 'emoji-category-grid';
    grid.dataset.recentGrid = rid;
    container.prepend(grid);
    container.prepend(header);
  }

  grid.innerHTML = '';
  recent.forEach(e => {
    const btn = document.createElement('button');
    btn.className = 'emoji-item';
    btn.textContent = e;
    btn.addEventListener('click', () => onPick(e));
    grid.appendChild(btn);
  });
}

let emojiPickerRecentId = null;

function initEmojiPicker() {
  const grid = document.getElementById('emoji-grid');
  const results = document.getElementById('emoji-search-results');
  const searchInput = document.getElementById('emoji-search');

  const onPick = e => {
    trackRecentEmoji(e);
    const input = document.getElementById('message-input');
    input.value += e;
    input.focus();
    closeEmojiPickerFull();
  };

  emojiPickerRecentId = buildEmojiGrid(grid, onPick, { recentId: 'main-picker' });

  searchInput.addEventListener('input', () => {
    renderEmojiSearchResults(searchInput.value.trim().toLowerCase(), grid, results, onPick);
  });
}

function closeEmojiPickerFull() {
  document.getElementById('emoji-picker').classList.remove('open');
  const searchInput = document.getElementById('emoji-search');
  searchInput.value = '';
  document.getElementById('emoji-grid').style.display = '';
  const results = document.getElementById('emoji-search-results');
  results.style.display = 'none';
  results.innerHTML = '';
}


// --- Init ---

document.addEventListener('DOMContentLoaded', async () => {
  loadSession();
  initEmojiPicker();

  // Allow Enter/Space to activate role="button" divs for keyboard accessibility
  document.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.getAttribute('role') === 'button' && e.target.tagName !== 'BUTTON') {
      e.preventDefault();
      e.target.click();
    }
    if (e.key === 'Escape' && dmChatChannel) {
      closeDMChat();
      openDMs();
    }
  });

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
    const picker = document.getElementById('emoji-picker');
    const opening = !picker.classList.contains('open');
    picker.classList.toggle('open');
    if (opening) {
      refreshRecentSection(document.getElementById('emoji-grid'), emojiPickerRecentId, em => {
        trackRecentEmoji(em);
        document.getElementById('message-input').value += em;
        document.getElementById('message-input').focus();
        closeEmojiPickerFull();
      });
      document.getElementById('emoji-search').focus();
    }
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('#emoji-picker') && !e.target.closest('#emoji-btn')) {
      closeEmojiPicker();
    }
    if (!e.target.closest('#reaction-picker') && !e.target.closest('.msg-react-btn')) {
      closeReactionPicker();
    }
  });

  // Message delete (delegated)

  document.getElementById('messages-container').addEventListener('click', async e => {
    const replyBtn = e.target.closest('.msg-reply-btn');
    if (replyBtn) {
      const msgId = parseInt(replyBtn.dataset.msgId);
      if (!isNaN(msgId)) startReply(msgId);
      return;
    }

    const replyCtx = e.target.closest('.reply-inline');
    if (replyCtx) {
      const targetId = replyCtx.dataset.replyId;
      const targetEl = document.querySelector(`.message[data-msg-id="${targetId}"]`);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetEl.classList.add('highlight');
        setTimeout(() => targetEl.classList.remove('highlight'), 1500);
      }
      return;
    }

    const reactBtn = e.target.closest('.msg-react-btn');
    if (reactBtn) {
      e.stopPropagation();
      const msgId = parseInt(reactBtn.dataset.msgId);
      if (!isNaN(msgId)) openReactionPicker(msgId, reactBtn);
      return;
    }

    const pill = e.target.closest('.reaction-pill');
    if (pill) {
      const msgId = parseInt(pill.dataset.msgId);
      const emoji = pill.dataset.emoji;
      if (isNaN(msgId)) return;
      if (pill.classList.contains('mine')) {
        await removeReaction(msgId);
      } else {
        await reactToMessage(msgId, emoji);
      }
      return;
    }

    const editBtn = e.target.closest('.msg-edit-btn');
    if (editBtn) {
      const msgId = parseInt(editBtn.dataset.msgId);
      if (!isNaN(msgId)) startEditMessage(msgId);
      return;
    }

    const delBtn = e.target.closest('.msg-delete-btn');
    if (delBtn) {
      if (!await showConfirm('Delete this message?')) return;
      const msgId = parseInt(delBtn.dataset.msgId);
      if (!isNaN(msgId)) await deleteMessage(msgId);
      return;
    }

    const img = e.target.closest('.message-img');
    if (img && img.dataset.mediaId) {
      window.open('/media/' + encodeURIComponent(img.dataset.mediaId), '_blank');
      return;
    }
  });

  // Member invite/kick (delegated)

  document.getElementById('members-sidebar').addEventListener('click', async e => {
    const kickBtn = e.target.closest('.kick-btn');
    if (kickBtn) {
      if (await showConfirm(`Kick ${kickBtn.dataset.username} from #${currentChannel}?`)) {
        await kickUserFromChannel(kickBtn.dataset.username);
      }
      return;
    }

    const inviteBtn = e.target.closest('.invite-user-btn');
    if (inviteBtn) toggleAddMemberDropdown();
  });

  // DMs

  document.getElementById('dm-btn').addEventListener('click', () => {
    if (dmOpen) {
      closeDMs();
      if (currentServer) switchServer(currentServer);
    } else {
      openDMs();
    }
  });

  // DM chat panel

  document.getElementById('dm-chat-back').addEventListener('click', () => {
    closeDMChat();
    openDMs();
  });

  document.getElementById('dm-chat-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const input = e.target;
      const text = input.value;
      input.value = '';
      sendDMMessage(text);
    }
  });

  document.getElementById('dm-chat-messages').addEventListener('click', async (e) => {
    const deleteBtn = e.target.closest('.msg-delete-btn');
    if (deleteBtn && dmChatChannel) {
      const msgId = deleteBtn.dataset.msgId;
      const { ok } = await apiPost(
        `/remove/message/${enc('dm-system')}/${enc('[SYSTEM] DM Category')}/${enc(dmChatChannel)}/${msgId}`,
        authBody()
      );
      if (ok) {
        const numId = Number(msgId);
        dmChatMessages = dmChatMessages.filter(m => m.id !== numId);
        if (dmChatLastSeen === numId) {
          // Find the new most recent message (last in display order = newest)
          const newest = dmChatMessages.length > 0 ? dmChatMessages[dmChatMessages.length - 1] : null;
          dmChatLastSeen = newest ? newest.id : -1;
        }
        renderDMChatMessages();
      }
    }
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

  // Mobile sidebar toggle

  document.getElementById('mobile-menu-btn').addEventListener('click', () => {
    document.querySelector('.app').classList.toggle('mobile-sidebar-open');
  });

  document.addEventListener('click', e => {
    const app = document.querySelector('.app');
    if (!app.classList.contains('mobile-sidebar-open')) return;
    const sidebar = document.querySelector('.channel-sidebar');
    const serverList = document.querySelector('.server-list');
    const btn = document.getElementById('mobile-menu-btn');
    if (!sidebar.contains(e.target) && !serverList.contains(e.target) && !btn.contains(e.target)) {
      app.classList.remove('mobile-sidebar-open');
    }
  });

  // Account menu

  const accountMenu = document.getElementById('account-menu');

  document.getElementById('account-menu-btn').addEventListener('click', e => {
    e.stopPropagation();
    accountMenu.classList.toggle('open');
  });

  document.getElementById('server-bar-settings-btn').addEventListener('click', e => {
    e.stopPropagation();
    accountMenu.classList.toggle('open');
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('#account-menu') && !e.target.closest('#account-menu-btn') && !e.target.closest('#server-bar-settings-btn')) {
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

  document.getElementById('toggle-notifications-btn').addEventListener('click', () => {
    if (!notificationsActive) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          notificationsActive = true;
          showToast('Notifications enabled.', 'success');
        } else {
          showToast('Notification permission denied.');
        }
      });
    } else {
      notificationsActive = false;
      showToast('Notifications disabled.', 'success');
    }
  });
  
  document.getElementById('logout-btn').addEventListener('click', async () => {
    accountMenu.classList.remove('open');
    if (await showConfirm('Log out of Neutrino?')) logout();
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
    if (!ok) return;

    serverThumbnailCache.set(currentServer, null);

    const icon = document.querySelector(`.server-icon[data-server="${CSS.escape(currentServer)}"]`);
    if (icon) {
      icon.innerHTML = '';
      icon.textContent = (currentServerName || '?')[0].toUpperCase();
    }
  });

  document.getElementById('rename-server-btn').addEventListener('click', () => {
    serverMenu.classList.remove('open');
    renameServer();
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
    if (!ok) return;

    currentServerPublic = newPublic;
    updateVisibilityBtn();
  });

  // Delete server

  document.getElementById('delete-server-btn').addEventListener('click', () => deleteServer());
  document.getElementById('leave-server-btn').addEventListener('click', () => leaveServer());

  // Add server

  document.querySelector('.add-server').addEventListener('click', async () => {
    const name = await showPrompt('New server name:');
    if (!name || !name.trim()) return;

    const result = await apiPost(`/new/server/${enc(name.trim())}`, authBody());
    if (!result.ok) return;

    const newId = result.data && result.data.data && result.data.data.id;
    const servers = await fetchMyServers();
    renderServerList(servers);

    if (newId) {
      await switchServer(newId);
    } else if (servers.length > 0) {
      await switchServer(servers[servers.length - 1].id);
    }
  });

  // Save drafts on page unload so in-progress input isn't lost
  window.addEventListener('beforeunload', () => {
    if (currentServer && currentChannel) {
      const val = document.getElementById('message-input').value;
      if (val.trim()) {
        drafts.set(`${currentServer}/${currentCategory}/${currentChannel}`, val);
      } else {
        drafts.delete(`${currentServer}/${currentCategory}/${currentChannel}`);
      }
      saveDrafts();
    }
    if (dmChatChannel) {
      const val = document.getElementById('dm-chat-input').value;
      if (val.trim()) {
        drafts.set(`dm:${dmChatChannel}`, val);
      } else {
        drafts.delete(`dm:${dmChatChannel}`);
      }
      saveDrafts();
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

  // Seed DM state so we don't fire notifications for old messages,
  // then start the DM poll (always runs for unread badge; browser
  // notifications only fire when notificationsActive is true).
  await seedDMNotifState();
  if (Notification.permission === 'granted') {
    notificationsActive = true;
  }
  startDMNotifPoll();

  const d = check.data.data || {};
  const servers = await fetchMyServers({ servers: d.servers || [], serverOrder: d.serverOrder || [] });
  renderServerList(servers);

  // Restore previous navigation state (call disableNavRestore() in console then reload to go to homepage)
  const skipRestore = localStorage.getItem('neutrino-skipNavRestore') === '1';
  localStorage.removeItem('neutrino-skipNavRestore');
  const nav = skipRestore ? null : loadNavState();

  if (skipRestore) {
    // disableNavRestore() was called — go straight to the homepage
    document.querySelector('.server-name').textContent = 'Neutrino';
    document.getElementById('channel-list').innerHTML = servers.length > 0
      ? '<div style="padding:16px;color:var(--text-muted);font-size:13px">Select a server.</div>'
      : '<div style="padding:16px;color:var(--text-muted);font-size:13px">No servers yet. Click + to create one.</div>';
    resetChatArea('Select a server and channel');
    return;
  }

  if (nav && nav.view === 'dms') {
    openDMs();
    return;
  }

  if (nav && nav.view === 'dm-chat' && nav.channel) {
    openDMs();
    await openDMConversation(nav.channel, nav.otherUser);
    // If the channel failed to load, openDMConversation calls closeDMChat
    // and we'll be back on the DM list — that's fine.
    return;
  }

  if (nav && nav.view === 'channel' && nav.server && nav.category && nav.channel) {
    const valid = servers.some(s => s.id === nav.server);
    if (valid) {
      await switchServer(nav.server);
      // switchServer auto-clicks first channel; override to the saved one
      if (currentServer === nav.server) {
        await switchChannel(nav.category, nav.channel);
      }
      return;
    }
  }

  if (nav && nav.view === 'server' && nav.server) {
    const valid = servers.some(s => s.id === nav.server);
    if (valid) {
      await switchServer(nav.server);
      return;
    }
  }

  // Fall back to the first server instead of showing the homepage
  if (servers.length > 0) {
    await switchServer(servers[0].id);
    return;
  }

  document.querySelector('.server-name').textContent = 'Neutrino';
  document.getElementById('channel-list').innerHTML =
    '<div style="padding:16px;color:var(--text-muted);font-size:13px">No servers yet. Click + to create one.</div>';

  resetChatArea('Select a server and channel');
}

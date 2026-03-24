# Codebase Audit

## HIGH

### 7. No rate limiting on login or entity creation
**`Server/actions/sessionActions.go:9`, `userActions.go:11`, `serverActions.go:10`, `messageActions.go:155`** — Unlimited login attempts enable brute-force. Unlimited creation of users/servers/channels/messages enables memory exhaustion DoS.
**Fix:** Add per-IP and per-account rate limiting. Add global caps on entity counts.

---

## MEDIUM

### 13. Map mutation during iteration in migration
**`Server/serial/serialize.go:398-412`** — The migration loop calls `delete(serverMap, key)` and `serverMap[id] = srv` while ranging over `serverMap`. Can cause servers to be visited twice, skipped, or overwritten.
**Fix:** Collect changes in a separate map and apply after the loop.

### 14. `Tokenless` doesn't write a response on marshal failure
**`Server/core/response.go:27`** — If `json.Marshal` fails, the function logs and returns without writing any HTTP response, leaving the client hanging.
**Fix:** Write a 500 status code in the error branch.

### 15. Reaction content not validated
**`Server/actions/messageActions.go:83`** — Reactions can be any string of any length, including megabytes of text.
**Fix:** Cap at 8 characters.

### 16. `SetServerOrder` accepts arbitrary strings
**`Server/actions/userActions.go:136`** — The order array is stored without validating that the IDs are real servers the user belongs to.
**Fix:** Validate each ID.

### 17. Discord-blue colors leaked into red-branded app
**`Site/style.css:925, 981, 1015, 1021`** — Four rules use `rgba(88, 101, 242, ...)` (Discord blurple) instead of the app's brand red. Affects reply hover, message highlight, and reaction pill "mine" states.
**Fix:** Replace with `var(--brand-dim)` or `rgba(192, 57, 43, ...)`.

### 20. `authBody()` crashes when session is null
**`Site/app.js:163`** — Accesses `session.username` without a null guard.
**Fix:** Add `if (!session) return extra;` at the top.

### 21. Double-fire race in `startEditMessage`
**`Site/app.js:1030-1056`** — Enter key triggers `finish(true)` which is async. Blur can fire before it resolves, calling `finish` twice.
**Fix:** Add a `let finished = false` guard at the top of `finish`.

### 22. `esc()` doesn't escape single quotes
**`Site/app.js:131`** — Some HTML attributes in the codebase could be vulnerable if a value contains `'`.
**Fix:** Add `.replace(/'/g, '&#39;')`.

### 23. `formatText` crashes on null/undefined input
**`Site/app.js:452`** — `raw.replace(...)` throws TypeError if `raw` is null.
**Fix:** `let t = (raw || '').replace(...)`.

### 24. CSS selector injection via `currentServer`
**`Site/app.js:932, 1414, 1517, 1702, 2539`** — `querySelector` with unescaped `currentServer` in the selector string. Special CSS characters in the ID would break or mismatch.
**Fix:** Use `CSS.escape(currentServer)`.

### 25. Unauthenticated media serving
**`Server/actions/mediaActions.go:111`** — `GET /media/{id}` requires no authentication. Any leaked media ID is publicly accessible.
**Fix:** Require session auth, or accept as intentional CDN-like behavior and document it.

### 27. No error handling on `res.json()` in `_apiPost`
**`Site/app.js:192`** — If the server returns non-JSON (502, HTML error page), `res.json()` throws. The catch loses the real HTTP status code.
**Fix:** Catch JSON parse errors separately and preserve the status code.

### 28. Poll runs when tab is hidden
**`Site/app.js:1646`** — `setInterval(poll, 5000)` fires regardless of tab visibility, wasting bandwidth/battery.
**Fix:** Pause polling with `document.visibilitychange` listener.

---

## LOW

### 29. Global mutex bottleneck
**`Server/core/data.go:14`** — Single `sync.Mutex` serializes all requests including reads.
**Fix:** Use `sync.RWMutex` with `RLock` for read-only endpoints.

### 30. `Deserialize` ignores `UnmarshalText` error
**`Server/serial/serialize.go:288`** — Malformed timestamp silently becomes zero time, causing immediate session timeouts.
**Fix:** Check the error.

### 33. `SetsockoptInt` error swallowed
**`Server/listen_unix.go:15`, `listen_windows.go:15`** — Return value discarded.
**Fix:** Propagate the error.

### 35. `w.Write` return values ignored everywhere
**All handler files** — Write errors (e.g., client disconnect) are silently dropped. Low risk but worth noting.

### 42. Multiple overlays share `z-index: 100`
**`Site/style.css:263, 607, 1038, 1199, 1363`** — Server menu, account menu, reaction picker, member dropdown, and emoji picker all use `z-index: 100`. Stacking is determined by DOM order, not intent.
**Fix:** Establish a z-index scale (dropdowns 100, pickers 200, overlays 300).

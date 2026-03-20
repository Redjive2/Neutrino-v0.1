# Neutrino Supervisor — Audit Report

**Date:** 2026-03-20
**Scope:** `Neutrino Supervisor/main.go`, `Neutrino Server/main.go` (update endpoint)

---

## How It Works

The system has two parts:

1. **The supervisor** (`Neutrino Supervisor/main.go`) — a program that builds, runs,
   and babysits the Neutrino server. If the server crashes, the supervisor restarts it.

2. **The update endpoint** (`POST /supervisor/doupdate` in `Neutrino Server/main.go`) —
   a special URL on the server that, when called with the right password, saves all data
   to disk and then deliberately exits with code 2. The supervisor sees exit code 2 and
   knows it means "pull new code, rebuild, restart" rather than "something broke."

The supervisor figures out where the server code lives by looking at its own location on
disk. It expects this layout:

```
Dev/                     <-- single git repo
├── Neutrino Server/     <-- Go backend
├── Neutrino Site/       <-- frontend files
└── Neutrino Supervisor/ <-- this program
```

---

## Findings

### 1. Response May Not Reach the Client Before the Server Dies

**Severity: Should fix**

When someone calls `/supervisor/doupdate`, the server writes `{"status":"updating"}` to
the response, then starts a background task that waits 100 milliseconds, saves data, and
kills the process with `os.Exit(2)`.

The problem: `os.Exit` kills the entire program instantly — no cleanup runs. The 100ms
delay is meant to give the HTTP response time to reach the client, but there is no
guarantee. The response sits in a buffer and Go's HTTP server flushes it when the handler
returns, but the operating system still needs to push it out over the network. If the
background task fires `os.Exit` before that happens, the client gets a broken connection
instead of the JSON response.

**What could go wrong:** The person or script triggering the update gets a network error
and doesn't know whether the update was accepted or not.

**Fix:** Explicitly flush the response before starting the shutdown, and increase the
delay to give the TCP stack time to deliver it.

---

### 2. Concurrent Update Requests Could Corrupt the Snapshot

**Severity: Should fix**

If two update requests arrive at the same time, two background tasks start, and both try
to write the snapshot file simultaneously. The snapshot code writes to a temp file then
renames it, but two concurrent writers would clobber each other's temp file.

**What could go wrong:** The saved data file gets corrupted — half from one write, half
from another — and the server fails to load its state on the next startup.

**Fix:** Add a guard so only one update can be in progress at a time (e.g., an
`atomic.Bool` flag that the first request sets and the second one checks).

---

### 3. Port May Still Be in Use When the Server Restarts

**Severity: Should fix**

When the server process exits, the operating system holds the port (8080) in a "cooldown"
state (called TIME_WAIT) for up to 60 seconds. The supervisor tries to restart the server
almost immediately — for a crash it waits 2 seconds, for an update it waits 0 seconds.
The new server tries to listen on 8080, gets "address already in use," and fails to start.

**What could go wrong:** After every update (and some crashes), the server is down for up
to a minute while the port clears. The supervisor keeps restarting the server in a loop,
each attempt failing.

**Fix:** Either set the socket option `SO_REUSEADDR` (requires using `net.ListenConfig`
instead of the basic `http.ListenAndServe`), or add retry-with-backoff in the supervisor.

---

### 4. `go run` Doesn't Work — Only Compiled Binaries

**Severity: Good to know**

The supervisor finds the server directory by looking at where its own binary lives on disk.
If you run it with `go run main.go`, the binary is in a temp folder (`/var/folders/...`),
so all the relative paths are wrong and nothing works.

**What this means:** You must build the supervisor first (`go build -o supervisor .`) and
run the compiled binary. This is fine for production but can trip you up during development.

---

### 5. `os.Executable()` Error Is Silently Ignored

**Severity: Minor**

The `serverDir()` and `repoRoot()` functions call `os.Executable()` and discard the error
with `_`. If it ever fails, both functions silently return wrong paths.

**Realistic risk:** Very low — this function almost never fails. But if it does, the
supervisor will try to build in a nonexistent directory with no explanation why.

---

### 6. Build Failure After `git pull` — Old Binary Restarts Anyway

**Severity: Good to know**

If `git pull` succeeds but the new code doesn't compile (syntax error, missing import,
etc.), the supervisor logs the build error and then restarts the **old** binary. This is
actually reasonable — better to keep running the old version than to be completely down.

**What to be aware of:** The supervisor doesn't retry the build or alert anyone. You'd
need to check the logs to know the update partially failed. The server will keep running
the pre-update code until someone fixes the build and triggers another update.

---

### 7. No Signal Handling — Killing the Supervisor Orphans the Server

**Severity: Should fix**

If you press Ctrl+C or send a kill signal to the supervisor, it dies immediately. The
server process it spawned keeps running, but now nothing is watching it. There's no way to
trigger updates or automatic restarts anymore. You'd have to manually kill the server too.

**Fix:** The supervisor should catch interrupt/terminate signals, forward them to the
server process, wait for it to exit, then exit itself.

---

### 8. No Crash-Loop Protection

**Severity: Minor**

If the server has a bug that makes it crash on startup every time, the supervisor will
restart it every 2 seconds forever. This could fill up disk with log output and waste CPU.

**What it does now:** Waits a flat 2 seconds between crash restarts regardless of how many
times it has crashed.

**Better behavior:** Exponential backoff — wait 2s after the first crash, 4s after the
second, 8s after the third, up to some maximum like 60s. Reset the counter when the server
runs successfully for a while.

---

### 9. In-Flight Requests Are Killed on Update

**Severity: Good to know**

When `os.Exit(2)` fires, every HTTP request currently being handled is terminated
instantly. If someone is uploading a file or sending a message at that exact moment, their
request is lost. The data they were sending is gone.

**Realistic risk:** Low for a small-scale app — the window is very short. But it's worth
knowing that updates are not graceful. A proper fix would involve Go's
`http.Server.Shutdown()` which waits for in-flight requests to finish before exiting.

---

### 10. Password Is Hardcoded in Source

**Severity: Good to know**

The update endpoint password `c12x192w` is written directly in the server code. Anyone who
can read the source code (or decompile the binary) knows the password. For a personal
project this is fine, but for anything public-facing it should be moved to an environment
variable or config file.

---

### 11. Pre-existing: No Mutex on Global State

**Severity: Pre-existing, not caused by supervisor**

The server stores all its data (users, servers, messages) in global variables with no
locking. The update endpoint's snapshot runs in a background goroutine while other HTTP
handlers may be reading/writing the same data. This was already the case before the
supervisor was added — the auto-snapshot timer had the same issue.

---

## Summary

| #  | Finding                                      | Action      |
|----|----------------------------------------------|-------------|
| 1  | Response may not reach client before exit     | Should fix  |
| 2  | Concurrent updates could corrupt snapshot     | Should fix  |
| 3  | Port still in use on restart                  | Should fix  |
| 4  | Only works as compiled binary, not `go run`   | By design   |
| 5  | `os.Executable()` error ignored               | Minor       |
| 6  | Build failure falls back to old binary        | By design   |
| 7  | No signal forwarding to child process         | Should fix  |
| 8  | No crash-loop backoff                         | Minor       |
| 9  | In-flight requests killed on update           | Acceptable  |
| 10 | Password hardcoded in source                  | Acceptable  |
| 11 | No mutex on global state (pre-existing)       | Pre-existing|

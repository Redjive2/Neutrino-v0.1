package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"neutrino/actions"
	"neutrino/core"
	"neutrino/media"
	"neutrino/serial"
	"os"
	"sync/atomic"
	"syscall"
	"time"
)

const (
	snapshotFile = "data/snapshot.json"
	backupFile   = "data/backup.json"
)

var manifest = map[string]int{}

var updating atomic.Bool

func main() {
	fmt.Println("[" + fmt.Sprint(time.Now()) + "]  Initializing server.")

	if err := media.EnsureDir(); err != nil {
		fmt.Println("[" + fmt.Sprint(time.Now()) + "]  FATAL: could not create media directory: " + err.Error())
		return
	}

	// Load previous state from snapshot if it exists
	if found, err := serial.LoadFrom(snapshotFile); err != nil {
		fmt.Println("[" + fmt.Sprint(time.Now()) + "]  WARNING: failed to load snapshot: " + err.Error())
	} else if found {
		fmt.Println("[" + fmt.Sprint(time.Now()) + "]  Restored state from " + snapshotFile)
	} else {
		fmt.Println("[" + fmt.Sprint(time.Now()) + "]  No snapshot found, starting fresh.")
	}

	// Start automatic snapshotting (5-min primary, 1-hour backup)
	serial.StartAutoSnapshot(snapshotFile, backupFile)

	mux := http.NewServeMux()

	// Mutation endpoints — mark data dirty after each call
	mux.HandleFunc("POST /new/user/{name}", mutating(actions.CreateUser))
	mux.HandleFunc("POST /new/message/{server}/{category}/{channel}", mutating(actions.CreateMessage))
	mux.HandleFunc("POST /new/server/{name}", mutating(actions.CreateServer))
	mux.HandleFunc("POST /new/category/{server}/{name}", mutating(actions.CreateCategory))
	mux.HandleFunc("POST /new/channel/{server}/{category}/{name}", mutating(actions.CreateChannel))

	mux.HandleFunc("POST /join/server/{server}", mutating(actions.JoinServer))
	mux.HandleFunc("POST /leave/server/{server}", mutating(actions.LeaveServer))

	mux.HandleFunc("POST /invite/server/{user}/{server}", mutating(actions.AddUserToServer))
	mux.HandleFunc("POST /invite/channel/{user}/{server}/{category}/{channel}", mutating(actions.AddUserToChannel))
	mux.HandleFunc("POST /kick/server/{user}/{server}", mutating(actions.KickUserFromServer))
	mux.HandleFunc("POST /kick/channel/{user}/{server}/{category}/{channel}", mutating(actions.KickUserFromChannel))

	mux.HandleFunc("POST /open/session/{user}", mutating(actions.OpenSession))
	mux.HandleFunc("POST /close/session", mutating(actions.CloseSession))

	mux.HandleFunc("POST /remove/user", mutating(actions.RemoveUser))
	mux.HandleFunc("POST /remove/message/{server}/{category}/{channel}/{id}", mutating(actions.RemoveMessage))
	mux.HandleFunc("POST /remove/server/{server}", mutating(actions.RemoveServer))
	mux.HandleFunc("POST /remove/category/{server}/{category}", mutating(actions.RemoveCategory))
	mux.HandleFunc("POST /remove/channel/{server}/{category}/{channel}", mutating(actions.RemoveChannel))

	mux.HandleFunc("POST /edit/user/{newname}", mutating(actions.EditUser))
	mux.HandleFunc("POST /edit/password", mutating(actions.EditPassword))
	mux.HandleFunc("POST /edit/message/{server}/{category}/{channel}/{id}", mutating(actions.EditMessage))
	mux.HandleFunc("POST /edit/server/{server}/{newname}", mutating(actions.EditServer))
	mux.HandleFunc("POST /edit/category/{server}/{category}/{newname}", mutating(actions.EditCategory))
	mux.HandleFunc("POST /edit/channel/{server}/{category}/{channel}/{newname}", mutating(actions.EditChannel))
	mux.HandleFunc("POST /edit/profilepic/{mediaid}", mutating(actions.SetProfilePic))
	mux.HandleFunc("POST /edit/thumbnail/{server}/{mediaid}", mutating(actions.SetServerThumbnail))
	mux.HandleFunc("POST /edit/serverorder", mutating(actions.SetServerOrder))
	mux.HandleFunc("POST /edit/visibility/{server}", mutating(actions.SetServerVisibility))

	// Media endpoints
	mux.HandleFunc("POST /media/upload", mutating(actions.UploadMedia))
	mux.HandleFunc("GET /media/{id}", actions.ServeMedia)

	// Read-only endpoints
	mux.HandleFunc("POST /get/manifest", actions.GetManifest)
	mux.HandleFunc("POST /get/server/{server}", actions.GetServerData)
	mux.HandleFunc("POST /get/channel/{server}/{category}/{channel}", actions.GetChannelData)
	mux.HandleFunc("POST /get/chat/{server}/{category}/{channel}/{id}", actions.GetChatsSince)
	mux.HandleFunc("POST /get/sessionstatus", actions.GetSessionStatus)

	// Supervisor endpoint
	mux.HandleFunc("POST /supervisor/doupdate", func(w http.ResponseWriter, r *http.Request) {
		var body struct {
			Password string `json:"password"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Password != "c12x192w" {
			w.WriteHeader(http.StatusForbidden)
			return
		}

		if !updating.CompareAndSwap(false, true) {
			w.WriteHeader(http.StatusConflict)
			w.Write([]byte(`{"error":"update already in progress"}`))
			return
		}

		w.Write([]byte(`{"status":"updating"}`))
		if f, ok := w.(http.Flusher); ok {
			f.Flush()
		}

		go func() {
			time.Sleep(500 * time.Millisecond)
			serial.SnapshotAndTrim(snapshotFile)
			os.Exit(2)
		}()
	})

	mux.HandleFunc("/Neutrino.htm", FileServer("../Neutrino Site/Neutrino.htm"))
	mux.HandleFunc("/style.css", FileServer("../Neutrino Site/style.css"))
	mux.HandleFunc("/app.js", FileServer("../Neutrino Site/app.js"))
	mux.HandleFunc("/favicon.ico", FileServer("../Neutrino Site/favicon.ico"))

	// Listen with SO_REUSEADDR so the port is available immediately after restart.
	lc := net.ListenConfig{
		Control: func(network, address string, c syscall.RawConn) error {
			return c.Control(func(fd uintptr) {
				syscall.SetsockoptInt(int(fd), syscall.SOL_SOCKET, syscall.SO_REUSEADDR, 1)
			})
		},
	}

	ln, err := lc.Listen(context.Background(), "tcp", ":8080")
	if err != nil {
		fmt.Println("[" + fmt.Sprint(time.Now()) + "]  FATAL: could not listen on :8080: " + err.Error())
		os.Exit(1)
	}

	http.Serve(ln, mux)
}

// mutating wraps a handler and marks data as dirty after it runs.
// After 1024 mutations, it triggers an immediate snapshot and trims
// in-memory channel histories to the most recent 64 messages.
func mutating(handler http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		handler(w, r)
		core.MarkDirty()

		if core.MutationCount >= 1024 {
			serial.SnapshotAndTrim(snapshotFile)
		}
	}
}

func FileServer(name string) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, name)
	}
}

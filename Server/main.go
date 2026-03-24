package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"neutrino/actions"
	"neutrino/core"
	"neutrino/media"
	"neutrino/secret"
	"neutrino/serial"
	"os"
	"os/signal"
	"sync/atomic"
	"syscall"
	"time"
)

const (
	snapshotFile = "data/snapshot.json"
	backupFile   = "data/backup.json"
)

var updating atomic.Bool

func main() {
	if len(os.Args) != 2 {
		panic("'1' argument expected (var port string); got '" + fmt.Sprint(len(os.Args)) + "'.")
	}

	port := os.Args[1]

	fmt.Println("[" + fmt.Sprint(time.Now()) + "]  Initializing server.")

	if err := secret.Load("~/neutrino_admin_pass.key"); err != nil {
		fmt.Println("[" + fmt.Sprint(time.Now()) + "]  FATAL: could not load supervisor key: " + err.Error())
		return
	}

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

	// Graceful shutdown: save snapshot on SIGINT/SIGTERM
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		sig := <-sigCh
		fmt.Println("[" + fmt.Sprint(time.Now()) + "]  Received " + sig.String() + ", saving final snapshot...")
		core.Mu.Lock()
		serial.SnapshotAndTrim(snapshotFile)
		core.Mu.Unlock()
		fmt.Println("[" + fmt.Sprint(time.Now()) + "]  Snapshot saved. Exiting.")
		os.Exit(0)
	}()

	mux := http.NewServeMux()

	// Mutation endpoints — mark data dirty after each call
	mux.HandleFunc("POST /new/user/{name}", mutating(actions.CreateUser))
	mux.HandleFunc("POST /new/message/{server}/{category}/{channel}", mutating(actions.CreateMessage))
	mux.HandleFunc("POST /new/server/{name}", mutating(actions.CreateServer))
	mux.HandleFunc("POST /new/category/{server}/{name}", mutating(actions.CreateCategory))
	mux.HandleFunc("POST /new/channel/{server}/{category}/{name}", mutating(actions.CreateChannel))
	mux.HandleFunc("POST /new/reaction/{server}/{category}/{channel}/{id}", mutating(actions.ReactMessage))

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
	mux.HandleFunc("POST /remove/reaction/{server}/{category}/{channel}/{id}", mutating(actions.RemoveReaction))

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
	mux.HandleFunc("GET /media/{id}", locked(actions.ServeMedia))

	// Read-only endpoints
	mux.HandleFunc("POST /get/manifest", locked(actions.GetManifest))
	mux.HandleFunc("POST /get/server/{server}", locked(actions.GetServerData))
	mux.HandleFunc("POST /get/channel/{server}/{category}/{channel}", locked(actions.GetChannelData))
	mux.HandleFunc("POST /get/chat/{server}/{category}/{channel}/{id}", locked(actions.GetChatsSince))
	mux.HandleFunc("POST /get/sessionstatus", locked(actions.GetSessionStatus))

	// Supervisor endpoint
	mux.HandleFunc("POST /supervisor/doupdate", func(w http.ResponseWriter, r *http.Request) {
		var body struct {
			Password string `json:"password"`
		}

		if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Password != secret.SupervisorPassword {
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
			core.Mu.Lock()
			serial.SnapshotAndTrim(snapshotFile)
			core.Mu.Unlock()
			os.Exit(2)
		}()
	})

	mux.HandleFunc("/", FileServer("../Site/Neutrino.htm"))
	mux.HandleFunc("/Neutrino.htm", FileServer("../Site/Neutrino.htm"))
	mux.HandleFunc("/style.css", FileServer("../Site/style.css"))
	mux.HandleFunc("/app.js", FileServer("../Site/app.js"))
	mux.HandleFunc("/favicon.ico", FileServer("../Site/favicon.ico"))

	ln, err := listen(":" + port)
	if err != nil {
		fmt.Println("[" + fmt.Sprint(time.Now()) + "]  FATAL: could not listen on :"+port+": " + err.Error())
		os.Exit(1)
	}

	fmt.Println("[" + fmt.Sprint(time.Now()) + "]  Listening on :" + port)
	if err := http.Serve(ln, mux); err != nil {
		fmt.Println("[" + fmt.Sprint(time.Now()) + "]  FATAL: " + err.Error())
		os.Exit(1)
	}
}

// statusWriter captures the response status code so mutating() can check
// whether the handler succeeded before marking data dirty.
type statusWriter struct {
	http.ResponseWriter
	code int
}

func (sw *statusWriter) WriteHeader(code int) {
	sw.code = code
	sw.ResponseWriter.WriteHeader(code)
}

// locked wraps a handler with the global mutex.
func locked(handler http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		core.Mu.Lock()
		defer core.Mu.Unlock()
		handler(w, r)
	}
}

// mutating wraps a handler, acquires the mutex, and marks data as dirty only
// if the handler returned a 2xx status. After 1024 mutations, it triggers an
// immediate snapshot and trims in-memory channel histories.
func mutating(handler http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		core.Mu.Lock()
		defer core.Mu.Unlock()

		sw := &statusWriter{ResponseWriter: w, code: 200}
		handler(sw, r)

		if sw.code >= 200 && sw.code < 300 {
			core.MarkDirty()
			if core.MutationCount >= 1024 {
				serial.SnapshotAndTrim(snapshotFile)
			}
		}
	}
}

func FileServer(name string) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Cache-Control", "no-cache")
		http.ServeFile(w, r, name)
	}
}

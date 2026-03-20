package main

import (
	"fmt"
	"net/http"
	"neutrino/actions"
	"neutrino/core"
	"neutrino/media"
	"neutrino/serial"
	"time"
)

const (
	snapshotFile = "data/snapshot.json"
	backupFile   = "data/backup.json"
)

var manifest = map[string]int{}

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

	// Mutation endpoints — mark data dirty after each call
	http.HandleFunc("POST /new/user/{name}", mutating(actions.CreateUser))
	http.HandleFunc("POST /new/message/{server}/{category}/{channel}", mutating(actions.CreateMessage))
	http.HandleFunc("POST /new/server/{name}", mutating(actions.CreateServer))
	http.HandleFunc("POST /new/category/{server}/{name}", mutating(actions.CreateCategory))
	http.HandleFunc("POST /new/channel/{server}/{category}/{name}", mutating(actions.CreateChannel))

	http.HandleFunc("POST /join/server/{server}", mutating(actions.JoinServer))
	http.HandleFunc("POST /leave/server/{server}", mutating(actions.LeaveServer))

	http.HandleFunc("POST /invite/server/{user}/{server}", mutating(actions.AddUserToServer))
	http.HandleFunc("POST /invite/channel/{user}/{server}/{category}/{channel}", mutating(actions.AddUserToChannel))
	http.HandleFunc("POST /kick/server/{user}/{server}", mutating(actions.KickUserFromServer))
	http.HandleFunc("POST /kick/channel/{user}/{server}/{category}/{channel}", mutating(actions.KickUserFromChannel))

	http.HandleFunc("POST /open/session/{user}", mutating(actions.OpenSession))
	http.HandleFunc("POST /close/session", mutating(actions.CloseSession))

	http.HandleFunc("POST /remove/user", mutating(actions.RemoveUser))
	http.HandleFunc("POST /remove/message/{server}/{category}/{channel}/{id}", mutating(actions.RemoveMessage))
	http.HandleFunc("POST /remove/server/{server}", mutating(actions.RemoveServer))
	http.HandleFunc("POST /remove/category/{server}/{category}", mutating(actions.RemoveCategory))
	http.HandleFunc("POST /remove/channel/{server}/{category}/{channel}", mutating(actions.RemoveChannel))

	http.HandleFunc("POST /edit/user/{newname}", mutating(actions.EditUser))
	http.HandleFunc("POST /edit/password", mutating(actions.EditPassword))
	http.HandleFunc("POST /edit/message/{server}/{category}/{channel}/{id}", mutating(actions.EditMessage))
	http.HandleFunc("POST /edit/server/{server}/{newname}", mutating(actions.EditServer))
	http.HandleFunc("POST /edit/category/{server}/{category}/{newname}", mutating(actions.EditCategory))
	http.HandleFunc("POST /edit/channel/{server}/{category}/{channel}/{newname}", mutating(actions.EditChannel))
	http.HandleFunc("POST /edit/profilepic/{mediaid}", mutating(actions.SetProfilePic))
	http.HandleFunc("POST /edit/thumbnail/{server}/{mediaid}", mutating(actions.SetServerThumbnail))
	http.HandleFunc("POST /edit/serverorder", mutating(actions.SetServerOrder))
	http.HandleFunc("POST /edit/visibility/{server}", mutating(actions.SetServerVisibility))

	// Media endpoints
	http.HandleFunc("POST /media/upload", mutating(actions.UploadMedia))
	http.HandleFunc("GET /media/{id}", actions.ServeMedia)

	// Read-only endpoints
	http.HandleFunc("POST /get/manifest", actions.GetManifest)
	http.HandleFunc("POST /get/server/{server}", actions.GetServerData)
	http.HandleFunc("POST /get/channel/{server}/{category}/{channel}", actions.GetChannelData)
	http.HandleFunc("POST /get/chat/{server}/{category}/{channel}/{id}", actions.GetChatsSince)
	http.HandleFunc("POST /get/sessionstatus", actions.GetSessionStatus)

	http.HandleFunc("/Neutrino.htm", FileServer("../Test Site New/Neutrino.htm"))
	http.HandleFunc("/style.css", FileServer("../Test Site New/style.css"))
	http.HandleFunc("/app.js", FileServer("../Test Site New/app.js"))
	http.HandleFunc("/favicon.ico", FileServer("../Test Site New/favicon.ico"))

	http.ListenAndServe(":8080", nil)
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

package actions

import (
	"encoding/hex"
	"encoding/json"
	"io"
	"net/http"
	"neutrino/core"
	"neutrino/media"
)

const maxAttachments = 10

func UploadMedia(w http.ResponseWriter, r *http.Request) {
	// Limit total request size
	r.Body = http.MaxBytesReader(w, r.Body, media.MaxFileSize+4096) // extra room for form fields

	if err := r.ParseMultipartForm(media.MaxFileSize); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		core.Tokenless(w, "(ERROR) Could not parse multipart form: "+err.Error(), nil, "Could not read the upload.")
		return
	}

	// Auth from form fields
	username := r.FormValue("username")
	tokenHex := r.FormValue("token")

	tokenBytes, err := hex.DecodeString(tokenHex)
	if err != nil || len(tokenBytes) != 32 {
		w.WriteHeader(http.StatusBadRequest)
		core.Tokenless(w, "(ERROR) Invalid token format.", nil, "Invalid session token.")
		return
	}

	var token [32]byte
	copy(token[:], tokenBytes)

	user, ok := core.GetUser(username, token, w)
	if !ok {
		return
	}

	// Read uploaded file
	file, header, err := r.FormFile("file")
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		core.WithToken(w, user, "(ERROR) No file provided.", nil, "No file was included in the upload.")
		return
	}
	defer file.Close()

	data, err := io.ReadAll(file)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		core.WithToken(w, user, "(ERROR) Could not read file.", nil, "Failed to read the uploaded file.")
		return
	}

	if int64(len(data)) > media.MaxFileSize {
		w.WriteHeader(http.StatusRequestEntityTooLarge)
		core.WithToken(w, user, "(ERROR) File exceeds 10 MB limit.", nil, "File is too large (max 10 MB).")
		return
	}

	// Validate content type by sniffing actual bytes
	mimeType, allowed := media.DetectType(data)
	if !allowed {
		w.WriteHeader(http.StatusUnsupportedMediaType)
		core.WithToken(w, user, "(ERROR) File type '"+mimeType+"' is not allowed.", nil, "File type '"+mimeType+"' is not supported.")
		return
	}

	// Generate ID and save to disk
	id, err := media.NewID()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		core.WithToken(w, user, "(ERROR) Could not generate media ID.", nil, "Failed to process the upload. Please try again.")
		return
	}

	if err := media.Save(id, data); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		core.WithToken(w, user, "(ERROR) Could not save media file.", nil, "Failed to save the file to disk. Please try again.")
		return
	}

	// Track metadata
	m := &core.Media{
		Id:       id,
		Uploader: user,
		MimeType: mimeType,
		Size:     int64(len(data)),
		OrigName: header.Filename,
	}
	core.MediaItems[id] = m

	type UploadResult struct {
		Id       string `json:"id"`
		MimeType string `json:"mimeType"`
		Size     int64  `json:"size"`
	}

	w.WriteHeader(http.StatusCreated)
	core.WithToken(w, user, "(INFO) Media '"+id+"' uploaded by '"+user.Name+"'.", UploadResult{
		Id:       id,
		MimeType: mimeType,
		Size:     int64(len(data)),
	}, "")
}

func ServeMedia(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	if !media.ValidateID(id) {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "invalid media ID"})
		return
	}

	m, found := core.MediaItems[id]
	if !found {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "media not found"})
		return
	}

	data, err := media.Load(id)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "could not read media file"})
		return
	}

	w.Header().Set("Content-Type", m.MimeType)
	w.Header().Set("Content-Disposition", "inline")
	w.Header().Set("Cache-Control", "public, max-age=86400")
	w.Write(data)
}

func SetProfilePic(w http.ResponseWriter, r *http.Request) {
	mediaId := r.PathValue("mediaid")

	body, ok := core.MustParse[core.SimpleRequest](w, r)
	if !ok {
		return
	}

	user, ok := core.GetUser(body.Username, body.Token, w)
	if !ok {
		return
	}

	if mediaId == "none" {
		user.ProfilePic = ""
		core.WithToken(w, user, "(INFO) Profile picture cleared for '"+user.Name+"'.", nil, "")
		return
	}

	if !media.ValidateID(mediaId) {
		w.WriteHeader(http.StatusBadRequest)
		core.WithToken(w, user, "(ERROR) Invalid media ID.", nil, "Invalid media ID.")
		return
	}

	m, found := core.MediaItems[mediaId]
	if !found {
		w.WriteHeader(http.StatusNotFound)
		core.WithToken(w, user, "(ERROR) Media '"+mediaId+"' not found.", nil, "That media doesn't exist.")
		return
	}

	// Only allow images for profile pics
	switch m.MimeType {
	case "image/png", "image/jpeg", "image/gif", "image/webp":
		// ok
	default:
		w.WriteHeader(http.StatusBadRequest)
		core.WithToken(w, user, "(ERROR) Profile pictures must be images.", nil, "Profile pictures must be image files.")
		return
	}

	user.ProfilePic = mediaId
	core.WithToken(w, user, "(INFO) Profile picture set for '"+user.Name+"'.", nil, "")
}

func SetServerThumbnail(w http.ResponseWriter, r *http.Request) {
	serverId := r.PathValue("server")
	mediaId := r.PathValue("mediaid")

	body, ok := core.MustParse[core.SimpleRequest](w, r)
	if !ok {
		return
	}

	user, ok := core.GetUser(body.Username, body.Token, w)
	if !ok {
		return
	}

	server, found := core.Servers[serverId]

	if !found {
		w.WriteHeader(http.StatusNotFound)
		core.WithToken(w, user, "(ERROR) Server '"+serverId+"' does not exist.", nil, "That server doesn't exist.")
		return
	}

	if user != server.Owner {
		w.WriteHeader(http.StatusForbidden)
		core.WithToken(w, user, "(ERROR) User '"+user.Name+"' is unauthorized to set thumbnail for server '"+serverId+"'.", nil, "You must be the server owner to change the thumbnail.")
		return
	}

	if mediaId == "none" {
		server.Thumbnail = ""
		core.WithToken(w, user, "(INFO) Server thumbnail cleared for server '"+serverId+"' by user '"+user.Name+"'.", nil, "")
		return
	}

	if !media.ValidateID(mediaId) {
		w.WriteHeader(http.StatusBadRequest)
		core.WithToken(w, user, "(ERROR) Invalid media ID.", nil, "Invalid media ID.")
		return
	}

	m, found := core.MediaItems[mediaId]
	if !found {
		w.WriteHeader(http.StatusNotFound)
		core.WithToken(w, user, "(ERROR) Media '"+mediaId+"' not found.", nil, "That media doesn't exist.")
		return
	}

	// Only allow images for server thumbnails
	switch m.MimeType {
	case "image/png", "image/jpeg", "image/gif", "image/webp":
		// ok
	default:
		w.WriteHeader(http.StatusBadRequest)
		core.WithToken(w, user, "(ERROR) Server thumbnails must be images.", nil, "Server thumbnails must be image files.")
		return
	}

	server.Thumbnail = mediaId
	core.WithToken(w, user, "(INFO) Server thumbnail set for server '"+serverId+"' by user '"+user.Name+"'.", nil, "")
}
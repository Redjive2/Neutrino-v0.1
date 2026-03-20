package actions

import (
	"net/http"
	"neutrino/core"
	"slices"
	"sort"
	"strconv"
)

type ServerListEntry struct {
	Id        string `json:"id"`
	Name      string `json:"name"`
	Owner     string `json:"owner"`
	Thumbnail string `json:"thumbnail"`
	Public    bool   `json:"public"`
}

func GetManifest(w http.ResponseWriter, r *http.Request) {
	body, ok := core.MustParse[core.SimpleRequest](w, r)
	if !ok {
		return
	}

	user, ok := core.GetUser(body.Username, body.Token, w)
	if !ok {
		return
	}

	serverList := make([]ServerListEntry, 0, len(core.Servers))

	for _, server := range core.Servers {
		if !server.Public && !slices.Contains(server.Members, user) {
			continue
		}
		serverList = append(serverList, ServerListEntry{
			Id:        server.Id,
			Name:      server.Name,
			Owner:     server.Owner.Name,
			Thumbnail: server.Thumbnail,
			Public:    server.Public,
		})
	}

	sort.Slice(serverList, func(a, b int) bool {
		return serverList[a].Name < serverList[b].Name
	})

	type ManifestData struct {
		Servers     []ServerListEntry `json:"servers"`
		ServerOrder []string          `json:"serverOrder"`
	}

	core.WithToken(w, user, "(INFO) Manifest sent to '"+user.Name+"'.", ManifestData{
		Servers:     serverList,
		ServerOrder: user.ServerOrder,
	})
}

type CategoryData struct {
	Name     string   `json:"name"`
	Channels []string `json:"channels"`
}

type ServerData struct {
	Name       string         `json:"name"`
	Owner      string         `json:"owner"`
	Members    []string       `json:"members"`
	Categories []CategoryData `json:"categories"`
	Thumbnail  string         `json:"thumbnail"`
	Public     bool           `json:"public"`
}

func GetServerData(w http.ResponseWriter, r *http.Request) {
	serverId := r.PathValue("server")

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
		core.WithToken(w, user, "(ERROR) Cannot find server '"+serverId+"'.", nil)
		return
	}

	if !slices.Contains(server.Members, user) {
		w.WriteHeader(http.StatusUnauthorized)
		core.WithToken(w, user, "(ERROR) User '"+user.Name+"' is unauthorized to access information for server '"+server.Name+"'.", nil)
		return
	}

	members := make([]string, len(server.Members))
	for i, member := range server.Members {
		members[i] = member.Name
	}

	isOwner := user == server.Owner
	categories := make([]CategoryData, 0, len(server.Categories))

	for _, category := range server.Categories {
		channels := make([]string, 0, len(category.Channels))

		for _, channel := range category.Channels {
			if isOwner || slices.Contains(channel.Members, user) {
				channels = append(channels, channel.Name)
			}
		}

		if len(channels) == 0 && !isOwner {
			continue
		}

		sort.Strings(channels)

		categories = append(categories, CategoryData{
			Name:     category.Name,
			Channels: channels,
		})
	}

	sort.Slice(categories, func(a, b int) bool {
		return categories[a].Name < categories[b].Name
	})

	serverData := ServerData{
		Name:       server.Name,
		Owner:      server.Owner.Name,
		Members:    members,
		Categories: categories,
		Thumbnail:  server.Thumbnail,
		Public:     server.Public,
	}

	core.WithToken(w, user, "(INFO) Data for server '"+serverId+"' sent to '"+user.Name+"'.", serverData)
}

type AttachmentInfo struct {
	Id       string `json:"id"`
	MimeType string `json:"mimeType"`
}

type MessageData struct {
	From        string           `json:"from"`
	Content     string           `json:"content"`
	Id          int              `json:"id"`
	Attachments []AttachmentInfo `json:"attachments,omitempty"`
}

const pageSize = 64

type ChannelDataRequest struct {
	Username string   `json:"username"`
	Token    [32]byte `json:"token"`
	Before   int      `json:"before"` // message ID; return messages older than this. -1 or 0 = newest page.
}

type ChannelData struct {
	Members []string      `json:"members"`
	History []MessageData `json:"history"`
	HasMore bool          `json:"hasMore"`
}

func GetChannelData(w http.ResponseWriter, r *http.Request) {
	serverId := r.PathValue("server")
	categoryName := r.PathValue("category")
	channelName := r.PathValue("channel")

	body, ok := core.MustParse[ChannelDataRequest](w, r)
	if !ok {
		return
	}

	user, ok := core.GetUser(body.Username, body.Token, w)
	if !ok {
		return
	}

	channel, err := core.ResolveChannel(serverId, categoryName, channelName, user)
	if err != nil {
		re := err.(core.ResolutionError)

		w.WriteHeader(re.Status())
		core.WithToken(w, user, "(ERROR) Could not resolve channel '"+serverId+"/"+categoryName+":"+channelName+"'; got resolution error '"+err.Error()+"'.", nil)

		return
	}

	if !slices.Contains(channel.Members, user) {
		w.WriteHeader(http.StatusUnauthorized)
		core.WithToken(w, user, "(ERROR) User '"+user.Name+"' is unauthorized to access information for channel '"+serverId+"/"+categoryName+":"+channelName+"'.", nil)
		return
	}

	members := make([]string, len(channel.Members))
	for i, member := range channel.Members {
		members[i] = member.Name
	}

	// History is stored newest-first. Find the starting slice based on `before`.
	hist := channel.History
	startIdx := 0

	if body.Before > 0 {
		// Find the index of the message with this ID, then start after it
		for i, msg := range hist {
			if msg.Id == body.Before {
				startIdx = i + 1
				break
			}
		}
	}

	// Slice the page
	endIdx := startIdx + pageSize
	hasMore := false
	if endIdx < len(hist) {
		hasMore = true
	} else {
		endIdx = len(hist)
	}

	page := hist[startIdx:endIdx]
	history := make([]MessageData, len(page))

	for i, message := range page {
		history[i] = MessageData{
			From:        message.From.Name,
			Content:     message.Content,
			Id:          message.Id,
			Attachments: resolveAttachments(message.Attachments),
		}
	}

	channelData := ChannelData{
		Members: members,
		History: history,
		HasMore: hasMore,
	}

	core.WithToken(w, user, "(INFO) Data for channel '"+serverId+"/"+categoryName+":"+channelName+"' sent to '"+user.Name+"'.", channelData)
}

func GetChatsSince(w http.ResponseWriter, r *http.Request) {
	serverId := r.PathValue("server")
	categoryName := r.PathValue("category")
	channelName := r.PathValue("channel")
	lastIdString := r.PathValue("id")

	lastId, lastIdParseErr := strconv.Atoi(lastIdString)

	body, ok := core.MustParse[core.SimpleRequest](w, r)
	if !ok {
		return
	}

	user, ok := core.GetUser(body.Username, body.Token, w)
	if !ok {
		return
	}

	if lastIdParseErr != nil {
		w.WriteHeader(http.StatusBadRequest)
		core.WithToken(w, user, "(ERROR) Message ID '"+lastIdString+"' could not be parsed.", nil)
		return
	}

	channel, err := core.ResolveChannel(serverId, categoryName, channelName, user)
	if err != nil {
		re := err.(core.ResolutionError)

		w.WriteHeader(re.Status())
		core.WithToken(w, user, "(ERROR) Could not resolve channel '"+serverId+"/"+categoryName+":"+channelName+"'; got resolution error '"+err.Error()+"'.", nil)

		return
	}

	index := slices.IndexFunc(channel.History, func(message *core.Message) bool {
		return message.Id == lastId
	})

	if index == -1 {
		w.WriteHeader(http.StatusBadRequest)
		core.WithToken(w, user, "(ERROR) Could not find message #"+lastIdString+" in channel '"+serverId+"/"+categoryName+":"+channelName+"'.", nil)
		return
	}

	chatsSinceLastId := channel.History[:index]

	messagesData := make([]MessageData, len(chatsSinceLastId))

	for i, message := range chatsSinceLastId {
		messagesData[i] = MessageData{
			From:        message.From.Name,
			Content:     message.Content,
			Id:          message.Id,
			Attachments: resolveAttachments(message.Attachments),
		}
	}

	core.WithToken(w, user, "(INFO) Chats since #"+lastIdString+" in channel '"+serverId+"/"+categoryName+":"+channelName+"' sent to '"+user.Name+"'.", messagesData)
}

type NamedRequest struct {
	Username string `json:"username"`
}

func GetSessionStatus(w http.ResponseWriter, r *http.Request) {
	body, ok := core.MustParse[NamedRequest](w, r)
	if !ok {
		return
	}

	user, found := core.Users[body.Username]
	if !found {
		w.WriteHeader(http.StatusNotFound)
		core.Tokenless(w, "(ERROR) User '"+body.Username+"' does not exist.", nil)
		return
	}

	type Status struct {
		Active     bool   `json:"active"`
		ProfilePic string `json:"profilePic,omitempty"`
	}

	status := Status{Active: user.Active, ProfilePic: user.ProfilePic}
	core.Tokenless(w, "(INFO) Returning session status for user '"+body.Username+"'.", status)
}

func resolveAttachments(ids []string) []AttachmentInfo {
	if len(ids) == 0 {
		return nil
	}
	out := make([]AttachmentInfo, len(ids))
	for i, id := range ids {
		mimeType := ""
		if m, ok := core.MediaItems[id]; ok {
			mimeType = m.MimeType
		}
		out[i] = AttachmentInfo{Id: id, MimeType: mimeType}
	}
	return out
}

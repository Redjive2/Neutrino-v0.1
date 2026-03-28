package actions

import (
	"net/http"
	"neutrino/core"
	"slices"
	"sort"
	"strings"
)

func OpenDM(w http.ResponseWriter, r *http.Request) {
	targetUsername := r.PathValue("targetuser")

	body, ok := core.MustParse[core.SimpleRequest](w, r)
	if !ok {
		return
	}

	user, ok := core.GetUser(body.Username, body.Token, w)
	if !ok {
		return
	}

	if core.DMServer == nil {
		w.WriteHeader(http.StatusInternalServerError)
		core.WithToken(w, user, "(ERROR) DM server not initialized.", nil, "DMs are not available right now.")
		return
	}

	targetUser, found := core.Users[targetUsername]
	if !found {
		w.WriteHeader(http.StatusNotFound)
		core.WithToken(w, user, "(ERROR) Target user '"+targetUsername+"' does not exist.", nil, "That user doesn't exist.")
		return
	}

	if targetUser == user {
		w.WriteHeader(http.StatusBadRequest)
		core.WithToken(w, user, "(ERROR) User '"+user.Name+"' attempted to DM themselves.", nil, "You can't DM yourself.")
		return
	}

	channelName := core.DMChannelName(user.Id, targetUser.Id)
	dmCategory := core.DMServer.Categories[core.DMCategoryName]

	if _, exists := dmCategory.Channels[channelName]; exists {
		core.WithToken(w, user, "(INFO) DM channel already exists between '"+user.Name+"' and '"+targetUsername+"'.", map[string]string{"channel": channelName}, "")
		return
	}

	chId, err := core.NewChannelID()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		core.WithToken(w, user, "(ERROR) Could not generate DM channel ID.", nil, "Failed to open DM. Please try again.")
		return
	}

	channel := &core.Channel{
		Id:      chId,
		Name:    channelName,
		History: []*core.Message{},
		Members: []*core.User{user, targetUser},
	}

	dmCategory.Channels[channelName] = channel
	core.Channels = append(core.Channels, channel)

	w.WriteHeader(http.StatusCreated)
	core.WithToken(w, user, "(INFO) DM channel created between '"+user.Name+"' and '"+targetUsername+"'.", map[string]string{"channel": channelName}, "")
}

type DMEntry struct {
	Channel     string `json:"channel"`
	OtherUser   string `json:"otherUser"`
	ProfilePic  string `json:"profilePic"`
	Preview     string `json:"preview"`
	PreviewFrom string `json:"previewFrom"`
	Timestamp   int64  `json:"timestamp"`
}

func GetDMs(w http.ResponseWriter, r *http.Request) {
	body, ok := core.MustParse[core.SimpleRequest](w, r)
	if !ok {
		return
	}

	user, ok := core.GetUser(body.Username, body.Token, w)
	if !ok {
		return
	}

	if core.DMServer == nil {
		core.WithToken(w, user, "(INFO) DM server not initialized; returning empty list.", []DMEntry{}, "")
		return
	}

	dmCategory := core.DMServer.Categories[core.DMCategoryName]
	entries := make([]DMEntry, 0)

	for _, channel := range dmCategory.Channels {
		if !slices.Contains(channel.Members, user) {
			continue
		}

		// Find the other user in the channel
		var other *core.User
		for _, m := range channel.Members {
			if m != user {
				other = m
				break
			}
		}
		if other == nil {
			continue
		}

		preview := ""
		previewFrom := ""
		var timestamp int64
		if len(channel.History) > 0 {
			latest := channel.History[0]
			preview = latest.Content
			if len(preview) > 100 {
				preview = preview[:100] + "…"
			}
			previewFrom = latest.From.Name
			timestamp = latest.Timestamp.UnixMilli()
		}

		entries = append(entries, DMEntry{
			Channel:     channel.Name,
			OtherUser:   other.Name,
			ProfilePic:  other.ProfilePic,
			Preview:     preview,
			PreviewFrom: previewFrom,
			Timestamp:   timestamp,
		})
	}

	// Sort by timestamp descending (most recent first)
	sort.Slice(entries, func(a, b int) bool {
		return entries[a].Timestamp > entries[b].Timestamp
	})

	core.WithToken(w, user, "(INFO) DM list sent to '"+user.Name+"'.", entries, "")
}

func RemoveDM(w http.ResponseWriter, r *http.Request) {
	channelName := r.PathValue("channel")

	body, ok := core.MustParse[core.SimpleRequest](w, r)
	if !ok {
		return
	}

	user, ok := core.GetUser(body.Username, body.Token, w)
	if !ok {
		return
	}

	if core.DMServer == nil {
		w.WriteHeader(http.StatusInternalServerError)
		core.WithToken(w, user, "(ERROR) DM server not initialized.", nil, "DMs are not available right now.")
		return
	}

	dmCategory := core.DMServer.Categories[core.DMCategoryName]

	// The channel name comes URL-encoded; the frontend sends the raw
	// "[SYSTEM] id1 id2" string as the path value, which net/http decodes.
	// However we also accept just "id1 id2" without the prefix for safety.
	if !strings.HasPrefix(channelName, "[SYSTEM] ") {
		channelName = "[SYSTEM] " + channelName
	}

	channel, exists := dmCategory.Channels[channelName]
	if !exists {
		w.WriteHeader(http.StatusNotFound)
		core.WithToken(w, user, "(ERROR) DM channel '"+channelName+"' does not exist.", nil, "That conversation doesn't exist.")
		return
	}

	if !slices.Contains(channel.Members, user) {
		w.WriteHeader(http.StatusForbidden)
		core.WithToken(w, user, "(ERROR) User '"+user.Name+"' is not a member of DM channel '"+channelName+"'.", nil, "You don't have access to this conversation.")
		return
	}

	core.RemoveChannelMessages(channel)
	delete(dmCategory.Channels, channelName)

	if idx := slices.Index(core.Channels, channel); idx != -1 {
		core.Channels = slices.Concat(core.Channels[:idx], core.Channels[idx+1:])
	}

	core.WithToken(w, user, "(INFO) DM channel '"+channelName+"' removed by '"+user.Name+"'.", nil, "")
}

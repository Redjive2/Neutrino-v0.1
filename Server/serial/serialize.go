package serial

import (
	"encoding/json"
	"neutrino/core"
	"os"
	"time"
)

// Target structs flatten pointer-based in-memory data into JSON.
// User, category, and channel cross-references use stable IDs (strings).
// Message cross-references use integer indices into the messages slice.

type UserTarget struct {
	Id          string   `json:"id,omitempty"`
	Active      bool     `json:"active"`
	LastRequest string   `json:"lastRequest"`
	Name        string   `json:"name"`
	Password    string   `json:"password"`
	Token       [32]byte `json:"token"`
	PrevToken   [32]byte `json:"prevToken"`
	ProfilePic  string   `json:"profilePic,omitempty"`
	ServerOrder []string `json:"serverOrder,omitempty"`
}

type ReactionTarget struct {
	From    any    `json:"from"` // string (user ID); legacy: float64 (index)
	Content string `json:"content"`
}

type MessageTarget struct {
	From        any              `json:"from"` // string (user ID); legacy: float64 (index)
	Content     string           `json:"content"`
	Id          int              `json:"id"`
	Timestamp   string           `json:"timestamp,omitempty"`
	Attachments []string         `json:"attachments,omitempty"`
	Reactions   []ReactionTarget `json:"reactions,omitempty"`
	RepliesTo   *int             `json:"repliesTo,omitempty"`
}

type MediaTarget struct {
	Id       string `json:"id"`
	Uploader any    `json:"uploader"` // string (user ID); legacy: float64 (index)
	MimeType string `json:"mimeType"`
	Size     int64  `json:"size"`
	OrigName string `json:"origName"`
}

type ServerTarget struct {
	Id         string            `json:"id"`
	Name       string            `json:"name"`
	Categories map[string]any    `json:"categories"` // name → string (category ID); legacy: float64 (index)
	Owner      any               `json:"owner"`      // string (user ID); legacy: float64 (index)
	Members    []any             `json:"members"`    // []string (user IDs); legacy: []float64 (indices)
	Thumbnail  string            `json:"thumbnail,omitempty"`
	Public     *bool             `json:"public,omitempty"`
}

type CategoryTarget struct {
	Id       string         `json:"id,omitempty"`
	Name     string         `json:"name"`
	Channels map[string]any `json:"channels"` // name → string (channel ID); legacy: float64 (index)
}

type ChannelTarget struct {
	Id      string `json:"id,omitempty"`
	Name    string `json:"name"`
	History []int  `json:"history"`
	Members []any  `json:"members"` // []string (user IDs); legacy: []float64 (indices)
}

type Snapshot struct {
	Users         []UserTarget     `json:"users"`
	Messages      []MessageTarget  `json:"messages"`
	Channels      []ChannelTarget  `json:"channels"`
	Categories    []CategoryTarget `json:"categories"`
	Servers       []ServerTarget   `json:"servers"`
	Media         []MediaTarget    `json:"media,omitempty"`
	NextMessageId int              `json:"nextMessageId"`
}

// --- Index maps ---

type indexMaps struct {
	userId  map[*core.User]string     // pointer -> user ID
	message map[*core.Message]int
	channel map[*core.Channel]string  // pointer -> channel ID
	cat     map[*core.Category]string // pointer -> category ID
}

func buildIndexMaps() indexMaps {
	m := indexMaps{
		userId:  make(map[*core.User]string, len(core.Users)+1),
		message: make(map[*core.Message]int, len(core.Messages)),
		channel: make(map[*core.Channel]string, len(core.Channels)),
		cat:     make(map[*core.Category]string, len(core.Categories)),
	}

	for _, u := range core.Users {
		m.userId[u] = u.Id
	}
	m.userId[core.DeletedUser] = core.DeletedUserID

	for i, msg := range core.Messages {
		m.message[msg] = i
	}
	for _, ch := range core.Channels {
		m.channel[ch] = ch.Id
	}
	for _, cat := range core.Categories {
		m.cat[cat] = cat.Id
	}

	return m
}

func userIdList(users []*core.User, m indexMaps) []any {
	out := make([]any, len(users))
	for i, u := range users {
		out[i] = m.userId[u]
	}
	return out
}

func messageIndices(msgs []*core.Message, m indexMaps) []int {
	out := make([]int, len(msgs))
	for i, msg := range msgs {
		out[i] = m.message[msg]
	}
	return out
}

// --- Conversion functions ---

func GetUserTargets() []UserTarget {
	// +1 for DeletedUser sentinel at the end
	users := make([]UserTarget, 0, len(core.Users)+1)

	for _, user := range core.Users {
		lastRequest, _ := user.LastRequest.MarshalText()

		users = append(users, UserTarget{
			Id:          user.Id,
			Active:      user.Active,
			LastRequest: string(lastRequest),
			Name:        user.Name,
			Password:    user.Password,
			Token:       core.HashToken(user.Token),
			PrevToken:   core.HashToken(user.PrevToken),
			ProfilePic:  user.ProfilePic,
			ServerOrder: user.ServerOrder,
		})
	}

	// Sentinel entry
	users = append(users, UserTarget{Id: core.DeletedUserID, Name: "[deleted]"})

	return users
}

func GetMessageTargets(m indexMaps) []MessageTarget {
	targets := make([]MessageTarget, len(core.Messages))

	for i, msg := range core.Messages {
		reactions := make([]ReactionTarget, len(msg.Reactions))
		for j, r := range msg.Reactions {
			reactions[j] = ReactionTarget{From: m.userId[r.From], Content: r.Content}
		}

		var repliesTo *int
		if msg.RepliesTo != nil {
			idx := m.message[msg.RepliesTo]
			repliesTo = &idx
		}

		var ts string
		if !msg.Timestamp.IsZero() {
			tsBytes, _ := msg.Timestamp.MarshalText()
			ts = string(tsBytes)
		}

		targets[i] = MessageTarget{
			From:        m.userId[msg.From],
			Content:     msg.Content,
			Id:          msg.Id,
			Timestamp:   ts,
			Attachments: msg.Attachments,
			Reactions:   reactions,
			RepliesTo:   repliesTo,
		}
	}

	return targets
}

func GetMediaTargets(m indexMaps) []MediaTarget {
	targets := make([]MediaTarget, 0, len(core.MediaItems))

	for _, media := range core.MediaItems {
		targets = append(targets, MediaTarget{
			Id:       media.Id,
			Uploader: m.userId[media.Uploader],
			MimeType: media.MimeType,
			Size:     media.Size,
			OrigName: media.OrigName,
		})
	}

	return targets
}

func GetChannelTargets(m indexMaps) []ChannelTarget {
	targets := make([]ChannelTarget, len(core.Channels))

	for i, ch := range core.Channels {
		targets[i] = ChannelTarget{
			Id:      ch.Id,
			Name:    ch.Name,
			History: messageIndices(ch.History, m),
			Members: userIdList(ch.Members, m),
		}
	}

	return targets
}

func GetCategoryTargets(m indexMaps) []CategoryTarget {
	targets := make([]CategoryTarget, len(core.Categories))

	for i, cat := range core.Categories {
		channels := make(map[string]any, len(cat.Channels))
		for name, ch := range cat.Channels {
			channels[name] = m.channel[ch]
		}

		targets[i] = CategoryTarget{
			Id:       cat.Id,
			Name:     cat.Name,
			Channels: channels,
		}
	}

	return targets
}

func GetServerTargets(m indexMaps) []ServerTarget {
	targets := make([]ServerTarget, 0, len(core.Servers))

	for _, srv := range core.Servers {
		categories := make(map[string]any, len(srv.Categories))
		for name, cat := range srv.Categories {
			categories[name] = m.cat[cat]
		}

		pub := srv.Public
		targets = append(targets, ServerTarget{
			Id:         srv.Id,
			Name:       srv.Name,
			Categories: categories,
			Owner:      m.userId[srv.Owner],
			Members:    userIdList(srv.Members, m),
			Thumbnail:  srv.Thumbnail,
			Public:     &pub,
		})
	}

	return targets
}

// --- Serialize: write full snapshot to file ---

func Serialize(targetFile *os.File) error {
	m := buildIndexMaps()

	snap := Snapshot{
		Users:         GetUserTargets(),
		Messages:      GetMessageTargets(m),
		Channels:      GetChannelTargets(m),
		Categories:    GetCategoryTargets(m),
		Servers:       GetServerTargets(m),
		Media:         GetMediaTargets(m),
		NextMessageId: core.NextMessageId,
	}

	enc := json.NewEncoder(targetFile)
	enc.SetIndent("", "  ")
	return enc.Encode(snap)
}

// --- Deserialize: restore full state from file ---

// resolveUserRef resolves a user reference that is either a string (user ID,
// new format) or a float64 (array index, legacy format).
func resolveUserRef(ref any, legacyUsers []*core.User, idMap map[string]*core.User) *core.User {
	switch v := ref.(type) {
	case string:
		if v == core.DeletedUserID {
			return core.DeletedUser
		}
		if u, ok := idMap[v]; ok {
			return u
		}
	case float64:
		idx := int(v)
		if idx >= 0 && idx < len(legacyUsers) {
			return legacyUsers[idx]
		}
	}
	return core.DeletedUser
}

func resolveUserRefs(refs []any, legacyUsers []*core.User, idMap map[string]*core.User) []*core.User {
	out := make([]*core.User, len(refs))
	for i, ref := range refs {
		out[i] = resolveUserRef(ref, legacyUsers, idMap)
	}
	return out
}

func Deserialize(sourceFile *os.File) error {
	var snap Snapshot

	if err := json.NewDecoder(sourceFile).Decode(&snap); err != nil {
		return err
	}

	// 1. Rebuild users
	users := make([]*core.User, len(snap.Users))
	userMap := make(map[string]*core.User, len(snap.Users))
	idMap := make(map[string]*core.User, len(snap.Users))
	needsIdMigration := false

	for i, ut := range snap.Users {
		if ut.Name == "[deleted]" {
			users[i] = core.DeletedUser
			idMap[core.DeletedUserID] = core.DeletedUser
			continue
		}

		var lastRequest time.Time
		lastRequest.UnmarshalText([]byte(ut.LastRequest))

		// Tokens in the snapshot are hashed and cannot be used for auth.
		// Invalidate all sessions on load — users must log in again.
		u := &core.User{
			Id:          ut.Id,
			Name:        ut.Name,
			Token:       [32]byte{},
			PrevToken:   [32]byte{},
			LastRequest: lastRequest,
			Active:      false,
			Password:    ut.Password,
			ProfilePic:  ut.ProfilePic,
			ServerOrder: ut.ServerOrder,
		}

		// Migration: assign IDs to users from old snapshots
		if u.Id == "" {
			needsIdMigration = true
			id, err := core.NewUserID()
			if err != nil {
				return err
			}
			u.Id = id
		}

		users[i] = u
		userMap[u.Name] = u
		idMap[u.Id] = u
	}

	if needsIdMigration {
		core.Dirty = true
	}

	// 2. Rebuild messages (From resolved via user ref — handles both ID and legacy index)
	messages := make([]*core.Message, len(snap.Messages))

	for i, mt := range snap.Messages {
		reactions := make([]core.Reaction, len(mt.Reactions))
		for j, rt := range mt.Reactions {
			reactions[j] = core.Reaction{From: resolveUserRef(rt.From, users, idMap), Content: rt.Content}
		}

		var timestamp time.Time
		if mt.Timestamp != "" {
			timestamp.UnmarshalText([]byte(mt.Timestamp))
		}

		msg := &core.Message{
			From:        resolveUserRef(mt.From, users, idMap),
			Content:     mt.Content,
			Id:          mt.Id,
			Timestamp:   timestamp,
			Attachments: mt.Attachments,
			Reactions:   reactions,
		}
		messages[i] = msg
	}

	// 2b. Resolve RepliesTo (second pass, all messages exist now)
	for i, mt := range snap.Messages {
		if mt.RepliesTo != nil {
			messages[i].RepliesTo = messages[*mt.RepliesTo]
		}
	}

	// 3. Rebuild channels
	channels := make([]*core.Channel, len(snap.Channels))
	channelIdMap := make(map[string]*core.Channel, len(snap.Channels))
	needsChannelMigration := false

	for i, ct := range snap.Channels {
		history := make([]*core.Message, len(ct.History))
		for j, idx := range ct.History {
			history[j] = messages[idx]
		}

		ch := &core.Channel{
			Id:      ct.Id,
			Name:    ct.Name,
			History: history,
			Members: resolveUserRefs(ct.Members, users, idMap),
		}

		if ch.Id == "" {
			needsChannelMigration = true
			id, err := core.NewChannelID()
			if err != nil {
				return err
			}
			ch.Id = id
		}

		channels[i] = ch
		channelIdMap[ch.Id] = ch
	}

	// 4. Rebuild categories
	categories := make([]*core.Category, len(snap.Categories))
	categoryIdMap := make(map[string]*core.Category, len(snap.Categories))
	needsCategoryMigration := false

	for i, cat := range snap.Categories {
		chMap := make(map[string]*core.Channel, len(cat.Channels))
		for name, ref := range cat.Channels {
			switch v := ref.(type) {
			case string:
				if ch, ok := channelIdMap[v]; ok {
					chMap[name] = ch
				}
			case float64:
				idx := int(v)
				if idx >= 0 && idx < len(channels) {
					chMap[name] = channels[idx]
				}
			}
		}

		c := &core.Category{
			Id:       cat.Id,
			Name:     cat.Name,
			Channels: chMap,
		}

		if c.Id == "" {
			needsCategoryMigration = true
			id, err := core.NewCategoryID()
			if err != nil {
				return err
			}
			c.Id = id
		}

		categories[i] = c
		categoryIdMap[c.Id] = c
	}

	if needsChannelMigration || needsCategoryMigration {
		core.Dirty = true
	}

	// 5. Rebuild servers
	serverMap := make(map[string]*core.Server, len(snap.Servers))

	for _, st := range snap.Servers {
		catMap := make(map[string]*core.Category, len(st.Categories))
		for name, ref := range st.Categories {
			switch v := ref.(type) {
			case string:
				if cat, ok := categoryIdMap[v]; ok {
					catMap[name] = cat
				}
			case float64:
				idx := int(v)
				if idx >= 0 && idx < len(categories) {
					catMap[name] = categories[idx]
				}
			}
		}

		pub := true
		if st.Public != nil {
			pub = *st.Public
		}
		serverMap[st.Id] = &core.Server{
			Id:         st.Id,
			Name:       st.Name,
			Categories: catMap,
			Owner:      resolveUserRef(st.Owner, users, idMap),
			Members:    resolveUserRefs(st.Members, users, idMap),
			Thumbnail:  st.Thumbnail,
			Public:     pub,
		}
	}

	// 5b. Migration: assign IDs to servers that lack them (old snapshots)
	nameToId := make(map[string]string, len(serverMap))
	needsServerMigration := false
	for key, srv := range serverMap {
		if srv.Id == "" {
			needsServerMigration = true
			id, err := core.NewServerID()
			if err != nil {
				return err
			}
			srv.Id = id
			delete(serverMap, key)
			serverMap[id] = srv
			nameToId[srv.Name] = id
		} else {
			nameToId[srv.Name] = srv.Id
		}
	}
	// Convert old name-based User.ServerOrder entries to IDs
	if needsServerMigration {
		for _, u := range users {
			for i, entry := range u.ServerOrder {
				if newId, ok := nameToId[entry]; ok {
					u.ServerOrder[i] = newId
				}
			}
		}
	}

	// 6. Rebuild User.Messages back-references
	for _, u := range users {
		u.Messages = nil
	}
	for _, msg := range messages {
		msg.From.Messages = append(msg.From.Messages, msg)
	}

	// 7. Rebuild media
	mediaMap := make(map[string]*core.Media, len(snap.Media))
	for _, mt := range snap.Media {
		mediaMap[mt.Id] = &core.Media{
			Id:       mt.Id,
			Uploader: resolveUserRef(mt.Uploader, users, idMap),
			MimeType: mt.MimeType,
			Size:     mt.Size,
			OrigName: mt.OrigName,
		}
	}

	// 8. Commit to global state
	core.Users = userMap
	core.Servers = serverMap
	core.Messages = messages
	core.Categories = categories
	core.Channels = channels
	core.MediaItems = mediaMap
	core.NextMessageId = snap.NextMessageId

	return nil
}

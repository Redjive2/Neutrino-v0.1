package serial

import (
	"encoding/json"
	"neutrino/core"
	"os"
	"time"
)

// Target structs flatten pointer-based in-memory data into index-based JSON.
// Cross-references use integer indices into the corresponding target slices.

type UserTarget struct {
	Active      bool     `json:"active"`
	LastRequest string   `json:"lastRequest"`
	Name        string   `json:"name"`
	Password    string   `json:"password"`
	Token       [32]byte `json:"token"`
	ProfilePic  string   `json:"profilePic,omitempty"`
	ServerOrder []string `json:"serverOrder,omitempty"`
}

type MessageTarget struct {
	From        int      `json:"from"`
	Content     string   `json:"content"`
	Id          int      `json:"id"`
	Attachments []string `json:"attachments,omitempty"`
}

type MediaTarget struct {
	Id       string `json:"id"`
	Uploader int    `json:"uploader"`
	MimeType string `json:"mimeType"`
	Size     int64  `json:"size"`
	OrigName string `json:"origName"`
}

type ServerTarget struct {
	Id         string         `json:"id"`
	Name       string         `json:"name"`
	Categories map[string]int `json:"categories"`
	Owner      int            `json:"owner"`
	Members    []int          `json:"members"`
	Thumbnail  string         `json:"thumbnail,omitempty"`
	Public     *bool          `json:"public,omitempty"`
}

type CategoryTarget struct {
	Name     string         `json:"name"`
	Channels map[string]int `json:"channels"`
}

type ChannelTarget struct {
	Name    string `json:"name"`
	History []int  `json:"history"`
	Members []int  `json:"members"`
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

// --- Index maps: pointer -> position in target slice ---

type indexMaps struct {
	user    map[*core.User]int
	message map[*core.Message]int
	channel map[*core.Channel]int
	cat     map[*core.Category]int
}

func buildIndexMaps() indexMaps {
	m := indexMaps{
		user:    make(map[*core.User]int, len(core.Users)),
		message: make(map[*core.Message]int, len(core.Messages)),
		channel: make(map[*core.Channel]int, len(core.Channels)),
		cat:     make(map[*core.Category]int, len(core.Categories)),
	}

	i := 0
	for _, u := range core.Users {
		m.user[u] = i
		i++
	}
	for i, msg := range core.Messages {
		m.message[msg] = i
	}
	for i, ch := range core.Channels {
		m.channel[ch] = i
	}
	for i, cat := range core.Categories {
		m.cat[cat] = i
	}

	return m
}

func userIndices(users []*core.User, m indexMaps) []int {
	out := make([]int, len(users))
	for i, u := range users {
		out[i] = m.user[u]
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
	users := make([]UserTarget, len(core.Users))
	i := 0

	for _, user := range core.Users {
		lastRequest, _ := user.LastRequest.MarshalText()

		users[i] = UserTarget{
			Active:      user.Active,
			LastRequest: string(lastRequest),
			Name:        user.Name,
			Password:    user.Password,
			Token:       user.Token,
			ProfilePic:  user.ProfilePic,
			ServerOrder: user.ServerOrder,
		}
		i++
	}

	return users
}

func GetMessageTargets(m indexMaps) []MessageTarget {
	targets := make([]MessageTarget, len(core.Messages))

	for i, msg := range core.Messages {
		targets[i] = MessageTarget{
			From:        m.user[msg.From],
			Content:     msg.Content,
			Id:          msg.Id,
			Attachments: msg.Attachments,
		}
	}

	return targets
}

func GetMediaTargets(m indexMaps) []MediaTarget {
	targets := make([]MediaTarget, 0, len(core.MediaItems))

	for _, media := range core.MediaItems {
		targets = append(targets, MediaTarget{
			Id:       media.Id,
			Uploader: m.user[media.Uploader],
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
			Name:    ch.Name,
			History: messageIndices(ch.History, m),
			Members: userIndices(ch.Members, m),
		}
	}

	return targets
}

func GetCategoryTargets(m indexMaps) []CategoryTarget {
	targets := make([]CategoryTarget, len(core.Categories))

	for i, cat := range core.Categories {
		channels := make(map[string]int, len(cat.Channels))
		for name, ch := range cat.Channels {
			channels[name] = m.channel[ch]
		}

		targets[i] = CategoryTarget{
			Name:     cat.Name,
			Channels: channels,
		}
	}

	return targets
}

func GetServerTargets(m indexMaps) []ServerTarget {
	targets := make([]ServerTarget, 0, len(core.Servers))

	for _, srv := range core.Servers {
		categories := make(map[string]int, len(srv.Categories))
		for name, cat := range srv.Categories {
			categories[name] = m.cat[cat]
		}

		pub := srv.Public
		targets = append(targets, ServerTarget{
			Id:         srv.Id,
			Name:       srv.Name,
			Categories: categories,
			Owner:      m.user[srv.Owner],
			Members:    userIndices(srv.Members, m),
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

func Deserialize(sourceFile *os.File) error {
	var snap Snapshot

	if err := json.NewDecoder(sourceFile).Decode(&snap); err != nil {
		return err
	}

	// 1. Rebuild users
	users := make([]*core.User, len(snap.Users))
	userMap := make(map[string]*core.User, len(snap.Users))

	for i, ut := range snap.Users {
		var lastRequest time.Time
		lastRequest.UnmarshalText([]byte(ut.LastRequest))

		u := &core.User{
			Name:        ut.Name,
			Token:       ut.Token,
			LastRequest: lastRequest,
			Active:      ut.Active,
			Password:    ut.Password,
			ProfilePic:  ut.ProfilePic,
			ServerOrder: ut.ServerOrder,
		}
		users[i] = u
		userMap[u.Name] = u
	}

	// 2. Rebuild messages (From resolved after users exist)
	messages := make([]*core.Message, len(snap.Messages))

	for i, mt := range snap.Messages {
		msg := &core.Message{
			From:        users[mt.From],
			Content:     mt.Content,
			Id:          mt.Id,
			Attachments: mt.Attachments,
		}
		messages[i] = msg
	}

	// 3. Rebuild channels
	channels := make([]*core.Channel, len(snap.Channels))

	for i, ct := range snap.Channels {
		history := make([]*core.Message, len(ct.History))
		for j, idx := range ct.History {
			history[j] = messages[idx]
		}

		members := make([]*core.User, len(ct.Members))
		for j, idx := range ct.Members {
			members[j] = users[idx]
		}

		channels[i] = &core.Channel{
			Name:    ct.Name,
			History: history,
			Members: members,
		}
	}

	// 4. Rebuild categories
	categories := make([]*core.Category, len(snap.Categories))

	for i, cat := range snap.Categories {
		chMap := make(map[string]*core.Channel, len(cat.Channels))
		for name, idx := range cat.Channels {
			chMap[name] = channels[idx]
		}

		categories[i] = &core.Category{
			Name:     cat.Name,
			Channels: chMap,
		}
	}

	// 5. Rebuild servers
	serverMap := make(map[string]*core.Server, len(snap.Servers))

	for _, st := range snap.Servers {
		catMap := make(map[string]*core.Category, len(st.Categories))
		for name, idx := range st.Categories {
			catMap[name] = categories[idx]
		}

		members := make([]*core.User, len(st.Members))
		for j, idx := range st.Members {
			members[j] = users[idx]
		}

		pub := true
		if st.Public != nil {
			pub = *st.Public
		}
		serverMap[st.Id] = &core.Server{
			Id:         st.Id,
			Name:       st.Name,
			Categories: catMap,
			Owner:      users[st.Owner],
			Members:    members,
			Thumbnail:  st.Thumbnail,
			Public:     pub,
		}
	}

	// 5b. Migration: assign IDs to servers that lack them (old snapshots)
	nameToId := make(map[string]string, len(serverMap))
	needsMigration := false
	for key, srv := range serverMap {
		if srv.Id == "" {
			needsMigration = true
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
	if needsMigration {
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
			Uploader: users[mt.Uploader],
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

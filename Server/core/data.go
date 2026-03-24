package core

import (
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"regexp"
	"slices"
	"strings"
	"sync"
)

const MaxChannelHistory = 64

var validNameRe = regexp.MustCompile(`^[a-zA-Z0-9_\-()\s]+$`)

// ValidateName trims whitespace and checks length and character set.
// Returns the trimmed name and true if valid, or empty string and false otherwise.
func ValidateName(name string, minLen, maxLen int) (string, bool) {
	name = strings.TrimSpace(name)
	if len(name) < minLen || len(name) > maxLen {
		return "", false
	}
	if !validNameRe.MatchString(name) {
		return "", false
	}
	return name, true
}

// Mu guards all shared state. Acquire before any read or write to global data.
var Mu sync.Mutex

const DeletedUserID = "deleted"

// DeletedUser is a sentinel user for messages whose author has been removed.
var DeletedUser = &User{Id: DeletedUserID, Name: "[deleted]"}

func NewUserID() (string, error) {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

var (
	Users         = map[string]*User{}
	Servers       = map[string]*Server{}
	Messages      = []*Message{}
	Categories    = []*Category{}
	Channels      = []*Channel{}
	MediaItems    = map[string]*Media{}
	NextMessageId = 0
	Dirty         = false
	MutationCount = 0
)

func MarkDirty() {
	Dirty = true
	MutationCount++
}

// TrimChannelHistories keeps only the most recent MaxChannelHistory messages
// per channel and rebuilds the global Messages and User.Messages lists.
func TrimChannelHistories() {
	// Collect all surviving messages from channel histories
	kept := make(map[*Message]bool)

	for _, ch := range Channels {
		if len(ch.History) > MaxChannelHistory {
			ch.History = ch.History[:MaxChannelHistory]
		}
		for _, msg := range ch.History {
			kept[msg] = true
		}
	}

	// Rebuild global Messages list with only kept messages
	trimmed := make([]*Message, 0, len(kept))
	for _, msg := range Messages {
		if kept[msg] {
			trimmed = append(trimmed, msg)
		}
	}
	Messages = trimmed

	// Rebuild User.Messages back-references
	for _, u := range Users {
		u.Messages = nil
	}
	DeletedUser.Messages = nil
	for _, msg := range Messages {
		msg.From.Messages = append(msg.From.Messages, msg)
	}
}

// RemoveChannelMessages removes all messages in a channel from the global
// Messages list and from each author's User.Messages list.
func RemoveChannelMessages(ch *Channel) {
	toRemove := make(map[*Message]bool, len(ch.History))
	for _, msg := range ch.History {
		toRemove[msg] = true
	}

	// Remove from global list
	filtered := make([]*Message, 0, len(Messages)-len(toRemove))
	for _, msg := range Messages {
		if !toRemove[msg] {
			filtered = append(filtered, msg)
		}
	}
	Messages = filtered

	// Remove from each user's message list
	for _, msg := range ch.History {
		u := msg.From
		userFiltered := make([]*Message, 0, len(u.Messages))
		for _, m := range u.Messages {
			if !toRemove[m] {
				userFiltered = append(userFiltered, m)
			}
		}
		u.Messages = userFiltered
	}
}

type ResolutionError int

const (
	ServerNotFound   ResolutionError = 0
	CategoryNotFound ResolutionError = 1
	ChannelNotFound  ResolutionError = 2
	UserNotInServer  ResolutionError = 3
	UserNotInChannel ResolutionError = 4
)

func (re ResolutionError) Error() string {
	switch re {
	case 0:
		return "ServerNotFound"
	case 1:
		return "CategoryNotFound"
	case 2:
		return "ChannelNotFound"
	case 3:
		return "UserNotInServer"
	case 4:
		return "UserNotInChannel"
	}

	return "Invalid Error Value"
}

func (re ResolutionError) Status() int {
	status := http.StatusNotFound

	if re == UserNotInChannel || re == UserNotInServer {
		status = http.StatusForbidden
	}

	return status
}

func NewCategoryID() (string, error) {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

func NewChannelID() (string, error) {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

func NewServerID() (string, error) {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

func ResolveChannel(serverId, categoryName, channelName string, user *User) (*Channel, error) {
	server, found := Servers[serverId]

	if !found {
		return nil, ServerNotFound
	}

	if !slices.Contains(server.Members, user) {
		return nil, UserNotInServer
	}

	category, found := server.Categories[categoryName]

	if !found {
		return nil, CategoryNotFound
	}

	channel, found := category.Channels[channelName]

	if !found {
		return nil, ChannelNotFound
	}

	if !slices.Contains(channel.Members, user) {
		return nil, UserNotInChannel
	}

	return channel, nil
}

package core

import "time"

type Server struct {
	Id         string
	Name       string
	Categories map[string]*Category
	Owner      *User
	Members    []*User
	Thumbnail  string // media ID, empty = no picture
	Public     bool
}

type Category struct {
	Id       string
	Name     string
	Channels map[string]*Channel
}

type Channel struct {
	Id      string
	Name    string
	History []*Message
	Members []*User
}

type User struct {
	Id          string
	Name        string
	Messages    []*Message
	Token       [32]byte
	PrevToken   [32]byte
	LastRequest time.Time
	Active      bool
	Password    string
	ProfilePic  string   // media ID, empty = no picture
	ServerOrder []string // user's preferred server display order
}

type Message struct {
	From        *User
	Content     string
	Id          int
	Timestamp   time.Time
	Attachments []string // media IDs
	Reactions   []Reaction
	RepliesTo   *Message
}

type Reaction struct {
	From    *User
	Content string
}

type Media struct {
	Id       string
	Uploader *User
	MimeType string
	Size     int64
	OrigName string
}

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
	Name     string
	Channels map[string]*Channel
}

type Channel struct {
	Name    string
	History []*Message
	Members []*User
}

type User struct {
	Name        string
	Messages    []*Message
	Token       [32]byte
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
	Attachments []string // media IDs
}

type Media struct {
	Id       string
	Uploader *User
	MimeType string
	Size     int64
	OrigName string
}

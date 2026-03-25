package actions

import (
	"fmt"
	"net/http"
	"neutrino/core"
	"slices"
)

func CreateServer(w http.ResponseWriter, r *http.Request) {
	serverName, valid := core.ValidateName(r.PathValue("name"), 3, 64)
	if !valid {
		w.WriteHeader(http.StatusBadRequest)
		core.Tokenless(w, "(ERROR) Invalid server name. Must be 3-64 characters, letters/numbers/_-() and spaces only.", nil, "Server names must be 3-64 characters and contain letters/numbers/_-() and spaces only.")
		return
	}

	body, ok := core.MustParse[core.SimpleRequest](w, r)
	if !ok {
		return
	}

	user, ok := core.GetUser(body.Username, body.Token, w)
	if !ok {
		return
	}

	id, err := core.NewServerID()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		core.WithToken(w, user, "(ERROR) Could not generate server ID.", nil, "Failed to create the server. Please try again.")
		return
	}

	server := core.Server{
		Id:         id,
		Name:       serverName,
		Categories: map[string]*core.Category{},
		Owner:      user,
		Members:    []*core.User{user},
		Thumbnail:  "none",
		Public:     true,
	}

	core.Servers[id] = &server

	w.WriteHeader(http.StatusCreated)
	core.WithToken(w, user, "(INFO) Server '"+serverName+"' created by user '"+user.Name+"'.", map[string]string{"id": id}, "")
}

func CreateCategory(w http.ResponseWriter, r *http.Request) {
	serverId := r.PathValue("server")
	categoryName, valid := core.ValidateName(r.PathValue("name"), 3, 64)
	if !valid {
		w.WriteHeader(http.StatusBadRequest)
		core.Tokenless(w, "(ERROR) Invalid category name. Must be 3-64 characters, letters/numbers/_-() and spaces only.", nil, "Category names must be 3-64 characters and contain letters/numbers/_-() and spaces only.")
		return
	}

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
		core.WithToken(w, user, "(ERROR) Server '"+serverId+"' does not exist.", nil, "This server does not exist.")
		return
	}

	if user != server.Owner {
		w.WriteHeader(http.StatusForbidden)
		core.WithToken(w, user, "(ERROR) User '"+user.Name+"' is not authorized to create category '"+serverId+"/"+categoryName+"' in server '"+serverId+"'.", nil, "You must be the server owner to create categories.")
		return
	}

	if _, categoryAlreadyExists := server.Categories[categoryName]; categoryAlreadyExists {
		w.WriteHeader(http.StatusNotAcceptable)
		core.WithToken(w, user, "(ERROR) Category '"+serverId+"/"+categoryName+"' already exists.", nil, "This category already exists.")
		return
	}

	catId, err := core.NewCategoryID()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		core.WithToken(w, user, "(ERROR) Could not generate category ID.", nil, "Failed to create the category. Please try again.")
		return
	}

	category := core.Category{
		Id:       catId,
		Name:     categoryName,
		Channels: map[string]*core.Channel{},
	}

	server.Categories[categoryName] = &category
	core.Categories = append(core.Categories, &category)

	core.WithToken(w, user, "(INFO) Category '"+serverId+"/"+categoryName+"' created by user '"+user.Name+"'.", nil, "")
}

func CreateChannel(w http.ResponseWriter, r *http.Request) {
	serverId := r.PathValue("server")
	categoryName := r.PathValue("category")
	channelName, valid := core.ValidateName(r.PathValue("name"), 3, 64)
	if !valid {
		w.WriteHeader(http.StatusBadRequest)
		core.Tokenless(w, "(ERROR) Invalid channel name. Must be 3-64 characters, letters/numbers/_-() and spaces only.", nil, "Channel names must be 3-64 characters, letters/numbers/_-() and spaces only.")
		return
	}

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
		core.WithToken(w, user, "(ERROR) Server '"+serverId+"' does not exist.", nil, "This server does not exist.")
		return
	}

	if user != server.Owner {
		w.WriteHeader(http.StatusForbidden)
		core.WithToken(w, user, "(ERROR) User '"+user.Name+"' is not authorized to create channel '"+serverId+"/"+categoryName+":"+channelName+"'.", nil, "You must be the server owner to create channels.")
		return
	}

	category, found := server.Categories[categoryName]

	if !found {
		w.WriteHeader(http.StatusNotFound)
		core.WithToken(w, user, "(ERROR) Category '"+serverId+"/"+categoryName+"' does not exist.", nil, "")
		return
	}

	if _, channelAlreadyExists := category.Channels[channelName]; channelAlreadyExists {
		w.WriteHeader(http.StatusBadRequest)
		core.WithToken(w, user, "(ERROR) Channel '"+serverId+"/"+categoryName+":"+channelName+"' already exists.", nil, "This channel already exists.")
		return
	}

	chId, err := core.NewChannelID()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		core.WithToken(w, user, "(ERROR) Could not generate channel ID.", nil, "Failed to create the channel. Please try again.")
		return
	}

	var members []*core.User
	if server.Public {
		members = make([]*core.User, len(server.Members))
		copy(members, server.Members)
	} else {
		members = []*core.User{user}
	}

	channel := core.Channel{
		Id:      chId,
		Name:    channelName,
		History: []*core.Message{},
		Members: members,
	}

	category.Channels[channelName] = &channel
	core.Channels = append(core.Channels, &channel)

	core.WithToken(w, user, "(INFO) Channel '"+serverId+"/"+categoryName+":"+channelName+"' created by user '"+user.Name+"'.", nil, "")
}

func RemoveServer(w http.ResponseWriter, r *http.Request) {
	serverId := r.PathValue("server")

	body, ok := core.MustParse[core.SimpleRequest](w, r)
	if !ok {
		return
	}

	user, ok := core.GetUser(body.Username, body.Token, w)
	if !ok {
		return
	}

	server, serverExists := core.Servers[serverId]

	if !serverExists {
		w.WriteHeader(http.StatusNotFound)
		core.WithToken(w, user, "(ERROR) Server '"+serverId+"' does not exist.", nil, "This server does not exist.")
		return
	}

	if user != server.Owner {
		w.WriteHeader(http.StatusForbidden)
		core.WithToken(w, user, "(ERROR) User '"+user.Name+"' is not authorized to remove server '"+serverId+"'.", nil, "You must be the owner to remove this server.")
		return
	}

	// Clean up messages, channels, and categories from global slices
	for _, category := range server.Categories {
		for _, channel := range category.Channels {
			core.RemoveChannelMessages(channel)
			if idx := slices.Index(core.Channels, channel); idx != -1 {
				core.Channels = slices.Concat(core.Channels[:idx], core.Channels[idx+1:])
			}
		}
		if idx := slices.Index(core.Categories, category); idx != -1 {
			core.Categories = slices.Concat(core.Categories[:idx], core.Categories[idx+1:])
		}
	}

	delete(core.Servers, serverId)

	core.WithToken(w, user, "(INFO) Server '"+serverId+"' removed by user '"+user.Name+"'.", nil, "")
}

func RemoveCategory(w http.ResponseWriter, r *http.Request) {
	serverId := r.PathValue("server")
	categoryName := r.PathValue("category")

	body, ok := core.MustParse[core.SimpleRequest](w, r)
	if !ok {
		return
	}

	user, ok := core.GetUser(body.Username, body.Token, w)
	if !ok {
		return
	}

	server, serverExists := core.Servers[serverId]

	if !serverExists {
		w.WriteHeader(http.StatusNotFound)
		core.WithToken(w, user, "(ERROR) Server '"+serverId+"' does not exist.", nil, "This server does not exist.")
		return
	}

	if user != server.Owner {
		w.WriteHeader(http.StatusForbidden)
		core.WithToken(w, user, "(ERROR) User '"+user.Name+"' is not authorized to remove category '"+serverId+"/"+categoryName+"'.", nil, "You must be the server owner to remove this category.")
		return
	}

	category, categoryExists := server.Categories[categoryName]

	if !categoryExists {
		w.WriteHeader(http.StatusNotFound)
		core.WithToken(w, user, "(ERROR) Category '"+serverId+"/"+categoryName+"' does not exist.", nil, "This category does not exist.")
		return
	}

	// Clean up messages and channels from global slices
	for _, channel := range category.Channels {
		core.RemoveChannelMessages(channel)
		if idx := slices.Index(core.Channels, channel); idx != -1 {
			core.Channels = slices.Concat(core.Channels[:idx], core.Channels[idx+1:])
		}
	}

	delete(server.Categories, categoryName)

	if idx := slices.Index(core.Categories, category); idx != -1 {
		core.Categories = slices.Concat(core.Categories[:idx], core.Categories[idx+1:])
	}

	core.WithToken(w, user, "(INFO) Category '"+serverId+"/"+categoryName+"' removed by user '"+user.Name+"'.", nil, "")
}

func RemoveChannel(w http.ResponseWriter, r *http.Request) {
	serverId := r.PathValue("server")
	categoryName := r.PathValue("category")
	channelName := r.PathValue("channel")

	body, ok := core.MustParse[core.SimpleRequest](w, r)
	if !ok {
		return
	}

	user, ok := core.GetUser(body.Username, body.Token, w)
	if !ok {
		return
	}

	server, serverExists := core.Servers[serverId]

	if !serverExists {
		w.WriteHeader(http.StatusNotFound)
		core.WithToken(w, user, "(ERROR) Server '"+serverId+"' does not exist.", nil, "This server does not exist.")
		return
	}

	if user != server.Owner {
		w.WriteHeader(http.StatusForbidden)
		core.WithToken(w, user, "(ERROR) User '"+user.Name+"' is not authorized to remove channel '"+serverId+"/"+categoryName+":"+channelName+"'.", nil, "You must be the owner to remove this channel.")
		return
	}

	category, categoryExists := server.Categories[categoryName]

	if !categoryExists {
		w.WriteHeader(http.StatusNotFound)
		core.WithToken(w, user, "(ERROR) Category '"+serverId+"/"+categoryName+"' does not exist.", nil, "This category does not exist.")
		return
	}

	if _, channelExists := category.Channels[channelName]; !channelExists {
		w.WriteHeader(http.StatusNotFound)
		core.WithToken(w, user, "(ERROR) Channel '"+serverId+"/"+categoryName+":"+channelName+"' does not exist.", nil, "This channel does not exist.")
		return
	}

	channel := category.Channels[channelName]

	core.RemoveChannelMessages(channel)

	delete(category.Channels, channelName)

	if idx := slices.Index(core.Channels, channel); idx != -1 {
		core.Channels = slices.Concat(core.Channels[:idx], core.Channels[idx+1:])
	}

	core.WithToken(w, user, "(INFO) Channel '"+serverId+"/"+categoryName+":"+channelName+"' removed by user '"+user.Name+"'.", nil, "")
}

func EditServer(w http.ResponseWriter, r *http.Request) {
	serverId := r.PathValue("server")
	newServerName, valid := core.ValidateName(r.PathValue("newname"), 3, 64)
	if !valid {
		w.WriteHeader(http.StatusBadRequest)
		core.Tokenless(w, "(ERROR) Invalid server name. Must be 3-64 characters, letters/numbers/_-() and spaces only.", nil, "Server names must be 3-64 characters, letters/numbers/_-() and spaces only.")
		return
	}

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
		core.WithToken(w, user, "(ERROR) Server '"+serverId+"' does not exist.", nil, "Server does not exist.")
		return
	}

	if user != server.Owner {
		w.WriteHeader(http.StatusForbidden)
		core.WithToken(w, user, "(ERROR) User '"+user.Name+"' is not authorized to edit server '"+serverId+"'.", nil, "You must be the owner to edit this server's name.")
		return
	}

	server.Name = newServerName

	core.WithToken(w, user, "(INFO) Server '"+serverId+"' name changed to '"+newServerName+"'.", nil, "")
}

func EditCategory(w http.ResponseWriter, r *http.Request) {
	serverId := r.PathValue("server")
	categoryName := r.PathValue("category")
	newCategoryName, valid := core.ValidateName(r.PathValue("newname"), 3, 64)
	if !valid {
		w.WriteHeader(http.StatusBadRequest)
		core.Tokenless(w, "(ERROR) Invalid category name. Must be 3-64 characters, letters/numbers/_-() and spaces only.", nil, "Category names must be 3-64 characters, letters/numbers/_-() and spaces only.")
		return
	}

	body, ok := core.MustParse[core.SimpleRequest](w, r)
	if !ok {
		return
	}

	user, ok := core.GetUser(body.Username, body.Token, w)
	if !ok {
		return
	}

	if categoryName == newCategoryName {
		w.WriteHeader(http.StatusBadRequest)
		core.WithToken(w, user, "(ERROR) Category '"+serverId+"/"+categoryName+"' already has name '"+serverId+"/"+categoryName+"'.", nil, "This category already has this name. Stupid.")
		return
	}

	server, found := core.Servers[serverId]

	if !found {
		w.WriteHeader(http.StatusNotFound)
		core.WithToken(w, user, "(ERROR) Server '"+serverId+"' does not exist.", nil, "This server does not exist.")
		return
	}

	category, found := server.Categories[categoryName]

	if !found {
		w.WriteHeader(http.StatusNotFound)
		core.WithToken(w, user, "(ERROR) Category '"+serverId+"/"+categoryName+"' does not exist.", nil, "This category does not exist.")
		return
	}

	if user != server.Owner {
		w.WriteHeader(http.StatusForbidden)
		core.WithToken(w, user, "(ERROR) User '"+user.Name+"' is not authorized to edit category '"+serverId+"/"+categoryName+"'.", nil, "You must be the server owner to rename categories.")
		return
	}

	category.Name = newCategoryName
	delete(server.Categories, categoryName)
	server.Categories[newCategoryName] = category

	core.WithToken(w, user, "(INFO) Category '"+serverId+"/"+categoryName+"' name changed to '"+serverId+"/"+newCategoryName+"'.", nil, "")
}

func EditChannel(w http.ResponseWriter, r *http.Request) {
	serverId := r.PathValue("server")
	categoryName := r.PathValue("category")
	channelName := r.PathValue("channel")
	newChannelName, valid := core.ValidateName(r.PathValue("newname"), 3, 64)
	if !valid {
		w.WriteHeader(http.StatusBadRequest)
		core.Tokenless(w, "(ERROR) Invalid channel name. Must be 3-64 characters, letters/numbers/_-() and spaces only.", nil, "Channel names must be 3-64 characters, letters/numbers/_-() and spaces only.")
		return
	}

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
		core.WithToken(w, user, "(ERROR) Server '"+serverId+"' does not exist.", nil, "This server does not exist.")
		return
	}

	if user != server.Owner {
		w.WriteHeader(http.StatusForbidden)
		core.WithToken(w, user, "(ERROR) User '"+user.Name+"' is not authorized to edit channel '"+serverId+"/"+categoryName+":"+channelName+"'.", nil, "You must be the owner to edit this channel.")
		return
	}

	category, found := server.Categories[categoryName]

	if !found {
		w.WriteHeader(http.StatusNotFound)
		core.WithToken(w, user, "(ERROR) Category '"+serverId+"/"+categoryName+"' does not exist.", nil, "This category does not exist.")
		return
	}

	channel, found := category.Channels[channelName]

	if !found {
		w.WriteHeader(http.StatusNotFound)
		core.WithToken(w, user, "(ERROR) Channel '"+serverId+"/"+categoryName+":"+channelName+"' does not exist.", nil, "This channel does not exist.")
		return
	}
	
	if channelName == newChannelName {
		w.WriteHeader(http.StatusBadRequest)
		core.WithToken(w, user, "(ERROR) Channel '"+serverId+"/"+categoryName+":"+channelName+"' already has name '"+serverId+"/"+categoryName+":"+channelName+"'.", nil, "This channel ALREADY HAS THIS NAME.")
		return
	}

	channel.Name = newChannelName
	delete(category.Channels, channelName)
	category.Channels[newChannelName] = channel

	core.WithToken(w, user, "(INFO) Channel '"+serverId+"/"+categoryName+":"+channelName+"' name changed to '"+serverId+"/"+categoryName+":"+newChannelName+"'.", nil, "")
}

func JoinServer(w http.ResponseWriter, r *http.Request) {
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
		core.WithToken(w, user, "(ERROR) Server '"+serverId+"' does not exist.", nil, "This server does not exist.")
		return
	}

	if !server.Public {
		w.WriteHeader(http.StatusForbidden)
		core.WithToken(w, user, "(ERROR) Server '"+serverId+"' is private.", nil, "This server is private.")
		return
	}

	if slices.Contains(server.Members, user) {
		w.WriteHeader(http.StatusBadRequest)
		core.WithToken(w, user, "(ERROR) User '"+user.Name+"' is already in server '"+serverId+"'.", nil, "You're already in this server, brotisserie chicken.")
		return
	}

	server.Members = append(server.Members, user)

	for _, category := range server.Categories {
		for _, channel := range category.Channels {
			if !slices.Contains(channel.Members, user) {
				channel.Members = append(channel.Members, user)
			}
		}
	}

	core.WithToken(w, user, "(INFO) User '"+user.Name+"' joined server '"+serverId+"'.", nil, "")
}

func LeaveServer(w http.ResponseWriter, r *http.Request) {
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
		core.WithToken(w, user, "(ERROR) Server '"+serverId+"' does not exist.", nil, "This server does not exist.")
		return
	}

	if user == server.Owner {
		w.WriteHeader(http.StatusForbidden)
		core.WithToken(w, user, "(ERROR) Owner cannot leave server '"+serverId+"'.", nil, "You cannot leave your own server. Come on, man.")
		return
	}

	index := slices.Index(server.Members, user)

	if index == -1 {
		w.WriteHeader(http.StatusBadRequest)
		core.WithToken(w, user, "(ERROR) User '"+user.Name+"' is not in server '"+serverId+"'.", nil, "You aren't even in this server.")
		return
	}

	server.Members = slices.Concat(server.Members[:index], server.Members[index+1:])

	for _, category := range server.Categories {
		for _, channel := range category.Channels {
			idx := slices.Index(channel.Members, user)
			if idx != -1 {
				channel.Members = slices.Concat(channel.Members[:idx], channel.Members[idx+1:])
			}
		}
	}

	core.WithToken(w, user, "(INFO) User '"+user.Name+"' left server '"+serverId+"'.", nil, "")
}

func SetServerVisibility(w http.ResponseWriter, r *http.Request) {
	serverId := r.PathValue("server")

	type VisibilityRequest struct {
		Username string   `json:"username"`
		Token    [32]byte `json:"token"`
		Public   bool     `json:"public"`
	}

	body, ok := core.MustParse[VisibilityRequest](w, r)
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
		core.WithToken(w, user, "(ERROR) Server '"+serverId+"' does not exist.", nil, "This server does not exist.")
		return
	}

	if user != server.Owner {
		w.WriteHeader(http.StatusForbidden)
		core.WithToken(w, user, "(ERROR) User '"+user.Name+"' is not authorized to change visibility of server '"+serverId+"'.", nil, "You must be the owner to change the visibility of this server.")
		return
	}

	server.Public = body.Public

	core.WithToken(w, user, "(INFO) Server '"+serverId+"' visibility set to public="+fmt.Sprint(body.Public)+" by user '"+user.Name+"'.", nil, "")
}

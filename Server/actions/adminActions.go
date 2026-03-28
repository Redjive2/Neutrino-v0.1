package actions

import (
	"net/http"
	"neutrino/core"
	"slices"
)

func AddUserToServer(w http.ResponseWriter, r *http.Request) {
	targetUsername := r.PathValue("user")
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
		core.WithToken(w, user, "(ERROR) Server '"+serverId+"' does not exist.", nil, "That server doesn't exist.")
		return
	}

	if server.Id == core.DMServerID {
		w.WriteHeader(http.StatusForbidden)
		core.WithToken(w, user, "(ERROR) User '"+user.Name+"' attempted to invite to the DM server.", nil, "You cannot invite users to the DM server.")
		return
	}

	if user != server.Owner {
		w.WriteHeader(http.StatusForbidden)
		core.WithToken(w, user, "(ERROR) User '"+user.Name+"' is not authorized to add target user '"+targetUsername+"' to server '"+serverId+"'.", nil, "You must be the server owner to add members.")
		return
	}

	targetUser, found := core.Users[targetUsername]

	if !found {
		w.WriteHeader(http.StatusNotFound)
		core.WithToken(w, user, "(ERROR) Target user '"+targetUsername+"' does not exist.", nil, "That user doesn't exist.")
		return
	}

	if slices.Contains(server.Members, targetUser) {
		w.WriteHeader(http.StatusBadRequest)
		core.WithToken(w, user, "(ERROR) Target user '"+targetUsername+"' is already in server '"+serverId+"'.", nil, targetUsername+" is already in this server.")
		return
	}

	server.Members = append(server.Members, targetUser)

	for _, category := range server.Categories {
		for _, channel := range category.Channels {
			if !slices.Contains(channel.Members, targetUser) {
				channel.Members = append(channel.Members, targetUser)
			}
		}
	}

	core.WithToken(w, user, "(INFO) Target user '"+targetUsername+"' added to server '"+serverId+"' by user '"+user.Name+"'.", nil, "")
}

func AddUserToChannel(w http.ResponseWriter, r *http.Request) {
	targetUsername := r.PathValue("user")
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

	server, found := core.Servers[serverId]

	if !found {
		w.WriteHeader(http.StatusNotFound)
		core.WithToken(w, user, "(ERROR) Server '"+serverId+"' does not exist.", nil, "That server doesn't exist.")
		return
	}

	if user != server.Owner {
		w.WriteHeader(http.StatusForbidden)
		core.WithToken(w, user, "(ERROR) User '"+user.Name+"' is not authorized to add target user '"+targetUsername+"' to channel '"+serverId+"/"+categoryName+":"+channelName+"'.", nil, "You must be the server owner to add members to channels.")
		return
	}

	targetUser, found := core.Users[targetUsername]

	if !found {
		w.WriteHeader(http.StatusNotFound)
		core.WithToken(w, user, "(ERROR) Target user '"+targetUsername+"' does not exist.", nil, "That user doesn't exist.")
		return
	}

	if !slices.Contains(server.Members, targetUser) {
		w.WriteHeader(http.StatusBadRequest)
		core.WithToken(w, user, "(ERROR) Target user '"+targetUsername+"' is not in server '"+serverId+"'.", nil, targetUsername+" isn't in this server.")
		return
	}

	channel, err := core.ResolveChannel(serverId, categoryName, channelName, user)

	if err != nil {
		re := err.(core.ResolutionError)

		w.WriteHeader(re.Status())
		core.WithToken(w, user, "(ERROR) Could not resolve channel '"+serverId+"/"+categoryName+":"+channelName+"'; got resolution error '"+err.Error()+"'.", nil, "Could not find that channel.")

		return
	}

	if slices.Contains(channel.Members, targetUser) {
		w.WriteHeader(http.StatusBadRequest)
		core.WithToken(w, user, "(ERROR) Target user '"+targetUsername+"' is already in channel '"+serverId+"/"+categoryName+":"+channelName+"'.", nil, targetUsername+" is already in this channel.")
		return
	}

	channel.Members = append(channel.Members, targetUser)

	core.WithToken(w, user, "(INFO) Target user '"+targetUsername+"' added to channel '"+serverId+"/"+categoryName+":"+channelName+"' by user '"+user.Name+"'.", nil, "")
}

func KickUserFromServer(w http.ResponseWriter, r *http.Request) {
	targetUsername := r.PathValue("user")
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
		core.WithToken(w, user, "(ERROR) Server '"+serverId+"' does not exist.", nil, "That server doesn't exist.")
		return
	}

	if user != server.Owner {
		w.WriteHeader(http.StatusUnauthorized)
		core.WithToken(w, user, "(ERROR) User '"+user.Name+"' does not own server '"+serverId+"'.", nil, "You must be the server owner to kick members.")
		return
	}

	targetUser, found := core.Users[targetUsername]

	if !found {
		w.WriteHeader(http.StatusNotFound)
		core.WithToken(w, user, "(ERROR) Target user '"+targetUsername+"' does not exist.", nil, "That user doesn't exist.")
		return
	}

	if targetUser == server.Owner {
		w.WriteHeader(http.StatusBadRequest)
		core.WithToken(w, user, "(ERROR) Cannot kick the server owner.", nil, "You can't kick yourself from your own server.")
		return
	}

	if !slices.Contains(server.Members, targetUser) {
		w.WriteHeader(http.StatusBadRequest)
		core.WithToken(w, user, "(ERROR) Target user '"+targetUsername+"' is not in server '"+serverId+"'.", nil, targetUsername+" isn't in this server.")
		return
	}

	index := slices.Index(server.Members, targetUser)
	server.Members = slices.Concat(server.Members[:index], server.Members[index+1:])

	for _, category := range server.Categories {
		for _, channel := range category.Channels {
			index := slices.Index(channel.Members, targetUser)

			if index == -1 {
				continue
			}

			channel.Members = slices.Concat(channel.Members[:index], channel.Members[index+1:])
		}
	}

	core.WithToken(w, user, "(INFO) Target user '"+targetUsername+"' kicked from server '"+serverId+"' by user '"+user.Name+"'.", nil, "")
}

func KickUserFromChannel(w http.ResponseWriter, r *http.Request) {
	targetUsername := r.PathValue("user")
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

	server, found := core.Servers[serverId]

	if !found {
		w.WriteHeader(http.StatusNotFound)
		core.WithToken(w, user, "(ERROR) Server '"+serverId+"' does not exist.", nil, "That server doesn't exist.")
		return
	}

	if user != server.Owner {
		w.WriteHeader(http.StatusUnauthorized)
		core.WithToken(w, user, "(ERROR) User '"+user.Name+"' does not own server '"+serverId+"'.", nil, "You must be the server owner to kick members from channels.")
		return
	}

	targetUser, found := core.Users[targetUsername]

	if !found {
		w.WriteHeader(http.StatusNotFound)
		core.WithToken(w, user, "(ERROR) Target user '"+targetUsername+"' does not exist.", nil, "That user doesn't exist.")
		return
	}

	if !slices.Contains(server.Members, targetUser) {
		w.WriteHeader(http.StatusBadRequest)
		core.WithToken(w, user, "(ERROR) Target user '"+targetUsername+"' is not in server '"+serverId+"'.", nil, targetUsername+" isn't in this server.")
		return
	}

	channel, err := core.ResolveChannel(serverId, categoryName, channelName, user)

	if err != nil {
		re := err.(core.ResolutionError)

		w.WriteHeader(re.Status())
		core.WithToken(w, user, "(ERROR) Could not resolve channel '"+serverId+"/"+categoryName+":"+channelName+"'; got resolution error '"+err.Error()+"'.", nil, "Could not find that channel.")

		return
	}

	index := slices.Index(channel.Members, targetUser)

	if index == -1 {
		w.WriteHeader(http.StatusBadRequest)
		core.WithToken(w, user, "(ERROR) Target user '"+targetUsername+"' is not in channel '"+serverId+"/"+categoryName+":"+channelName+"'.", nil, targetUsername+" isn't in this channel.")
		return
	}

	channel.Members = slices.Concat(channel.Members[:index], channel.Members[index+1:])

	core.WithToken(w, user, "(INFO) Target user '"+targetUsername+"' kicked from channel '"+serverId+"/"+categoryName+":"+channelName+"' by user '"+user.Name+"'.", nil, "")
}

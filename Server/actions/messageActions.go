package actions

import (
	"net/http"
	"neutrino/core"
	"slices"
	"strconv"
)

type MessageRequest struct {
	Username    string   `json:"username"`
	Token       [32]byte `json:"token"`
	Content     string   `json:"content"`
	Attachments []string `json:"attachments"`
}

func CreateMessage(w http.ResponseWriter, r *http.Request) {
	serverId := r.PathValue("server")
	categoryName := r.PathValue("category")
	channelName := r.PathValue("channel")

	body, ok := core.MustParse[MessageRequest](w, r)
	if !ok {
		return
	}

	user, ok := core.GetUser(body.Username, body.Token, w)
	if !ok {
		return
	}

	if len(body.Content) > 2048 {
		w.WriteHeader(http.StatusBadRequest)
		core.WithToken(w, user, "(ERROR) Message content exceeds 2048 character limit.", nil)
		return
	}

	if len(body.Attachments) > maxAttachments {
		w.WriteHeader(http.StatusBadRequest)
		core.WithToken(w, user, "(ERROR) Too many attachments (max 10).", nil)
		return
	}

	for _, aid := range body.Attachments {
		if _, found := core.MediaItems[aid]; !found {
			w.WriteHeader(http.StatusBadRequest)
			core.WithToken(w, user, "(ERROR) Attachment '"+aid+"' not found.", nil)
			return
		}
	}

	channel, err := core.ResolveChannel(serverId, categoryName, channelName, user)

	if err != nil {
		re := err.(core.ResolutionError)

		w.WriteHeader(re.Status())
		core.WithToken(w, user, "(ERROR) Could not resolve channel at path '"+serverId+"/"+categoryName+":"+channelName+"'; got resolution error '"+err.Error()+"'.", nil)

		return
	}

	id := core.NextMessageId
	core.NextMessageId++

	message := &core.Message{
		From:        user,
		Content:     body.Content,
		Id:          id,
		Attachments: body.Attachments,
	}

	core.Messages = append(core.Messages, message)

	channel.History = slices.Concat([]*core.Message{message}, channel.History)

	w.WriteHeader(http.StatusCreated)
	core.WithToken(w, user, "(INFO) Message #"+strconv.Itoa(message.Id)+" from user '"+user.Name+"' created.", message.Id)
}

func EditMessage(w http.ResponseWriter, r *http.Request) {
	serverId := r.PathValue("server")
	categoryName := r.PathValue("category")
	channelName := r.PathValue("channel")
	idString := r.PathValue("id")
	id, idParseError := strconv.Atoi(idString)

	body, ok := core.MustParse[MessageRequest](w, r)
	if !ok {
		return
	}

	user, ok := core.GetUser(body.Username, body.Token, w)
	if !ok {
		return
	}

	if idParseError != nil {
		w.WriteHeader(http.StatusBadRequest)
		core.WithToken(w, user, "(ERROR) Message ID '"+idString+"' could not be parsed.", nil)
		return
	}

	if len(body.Content) > 2048 {
		w.WriteHeader(http.StatusBadRequest)
		core.WithToken(w, user, "(ERROR) Message content exceeds 2048 character limit.", nil)
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
		return message.Id == id
	})

	if index == -1 {
		w.WriteHeader(http.StatusNotFound)
		core.WithToken(w, user, "(ERROR) Could not find message #"+idString+" from user '"+user.Name+"' in channel '"+serverId+"/"+categoryName+":"+channelName+"'.", nil)
		return
	}

	message := channel.History[index]
	server := core.Servers[serverId]

	if user != message.From && user != server.Owner {
		w.WriteHeader(http.StatusUnauthorized)
		core.WithToken(w, user, "(ERROR) User '"+user.Name+"' is not authorized to edit message #"+idString+" from user '"+message.From.Name+"'.", nil)
		return
	}

	channel.History[index].Content = body.Content

	core.WithToken(w, user, "(INFO) Message #"+idString+" from user '"+user.Name+"' edited.", nil)
}

func RemoveMessage(w http.ResponseWriter, r *http.Request) {
	serverId := r.PathValue("server")
	categoryName := r.PathValue("category")
	channelName := r.PathValue("channel")
	idString := r.PathValue("id")
	id, idParseError := strconv.Atoi(idString)

	body, ok := core.MustParse[MessageRequest](w, r)
	if !ok {
		return
	}

	user, ok := core.GetUser(body.Username, body.Token, w)
	if !ok {
		return
	}

	if idParseError != nil {
		w.WriteHeader(http.StatusBadRequest)
		core.WithToken(w, user, "(ERROR) Message ID '"+idString+"' could not be parsed.", nil)
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
		return message.Id == id
	})

	if index == -1 {
		w.WriteHeader(http.StatusNotFound)
		core.WithToken(w, user, "(ERROR) Could not find message #"+idString+" from user '"+user.Name+"' in channel '"+serverId+"/"+categoryName+":"+channelName+"'.", nil)
		return
	}

	message := channel.History[index]
	server := core.Servers[serverId]

	if user != message.From && user != server.Owner {
		w.WriteHeader(http.StatusUnauthorized)
		core.WithToken(w, user, "(ERROR) User '"+user.Name+"' is not authorized to remove message #"+idString+" from user '"+message.From.Name+"'.", nil)
		return
	}

	channel.History = slices.Concat(channel.History[:index], channel.History[index+1:])

	if globalIdx := slices.Index(core.Messages, message); globalIdx != -1 {
		core.Messages = slices.Concat(core.Messages[:globalIdx], core.Messages[globalIdx+1:])
	}

	core.WithToken(w, user, "(INFO) Message #"+idString+" from user '"+user.Name+"' removed.", nil)
}

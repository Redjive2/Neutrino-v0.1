package actions

import (
	"net/http"
	"neutrino/core"
	"slices"
	"strconv"
	"time"
)

type MessageRequest struct {
	Username    string   `json:"username"`
	Token       [32]byte `json:"token"`
	Content     string   `json:"content"`
	Attachments []string `json:"attachments"`
	ReplyTo     *int     `json:"replyTo"`
}

type ReactionRequest struct {
	Username string   `json:"username"`
	Token    [32]byte `json:"token"`
	Content  string   `json:"content"`
}

func ReactMessage(w http.ResponseWriter, r *http.Request) {
	var (
		serverId        = r.PathValue("server")
		categoryName    = r.PathValue("category")
		channelName     = r.PathValue("channel")
		targetMessageIdString = r.PathValue("id")
	)
	
	targetMessageId, parseErr := strconv.Atoi(targetMessageIdString)

	body, ok := core.MustParse[ReactionRequest](w, r)
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
		core.WithToken(w, user, "(ERROR) Could not resolve channel at path '"+serverId+"/"+categoryName+":"+channelName+"'; got resolution error '"+err.Error()+"'.", nil, "Could not find that channel.")

		return
	}

	if parseErr != nil {
		w.WriteHeader(http.StatusBadRequest)
		core.WithToken(w, user, "(ERROR) Message ID '"+targetMessageIdString+"' could not be parsed.", nil, "Invalid message ID.")
		return
	}

	index := slices.IndexFunc(channel.History, func(m *core.Message) bool {
		return m.Id == targetMessageId
	})

	if index == -1 {
		w.WriteHeader(http.StatusNotFound)
		core.WithToken(w, user, "(ERROR) Could not find message #"+targetMessageIdString+" in channel '"+serverId+"/"+categoryName+":"+channelName+"'.", nil, "That message doesn't exist.")
		return
	}

	message := channel.History[index]

	userAlreadyReacted := slices.ContainsFunc(message.Reactions, func(react core.Reaction) bool {
		return react.From == user
	})

	if userAlreadyReacted {
		w.WriteHeader(http.StatusBadRequest)
		core.WithToken(w, user, "(ERROR) User '"+user.Name+"' has already reacted to message #"+targetMessageIdString+".", nil, "You've already reacted to this message.")
		return
	}

	message.Reactions = append(message.Reactions, core.Reaction{
		From:    user,
		Content: body.Content,
	})

	core.WithToken(w, user, "(INFO) User '"+user.Name+"' added reaction '"+body.Content+"' to message #"+targetMessageIdString+" in channel '"+serverId+"/"+categoryName+":"+channelName+"'.", nil, "")
}

func RemoveReaction(w http.ResponseWriter, r *http.Request) {
	var (
		serverId        = r.PathValue("server")
		categoryName    = r.PathValue("category")
		channelName     = r.PathValue("channel")
		targetMessageIdString = r.PathValue("id")
	)
	
	targetMessageId, parseErr := strconv.Atoi(targetMessageIdString)

	body, ok := core.MustParse[core.SimpleRequest](w, r)
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
		core.WithToken(w, user, "(ERROR) Could not resolve channel at path '"+serverId+"/"+categoryName+":"+channelName+"'; got resolution error '"+err.Error()+"'.", nil, "Could not find that channel.")

		return
	}

	if parseErr != nil {
		w.WriteHeader(http.StatusBadRequest)
		core.WithToken(w, user, "(ERROR) Message ID '"+targetMessageIdString+"' could not be parsed.", nil, "Invalid message ID.")
		return
	}

	index := slices.IndexFunc(channel.History, func(m *core.Message) bool {
		return m.Id == targetMessageId
	})

	if index == -1 {
		w.WriteHeader(http.StatusNotFound)
		core.WithToken(w, user, "(ERROR) Could not find message #"+targetMessageIdString+" in channel '"+serverId+"/"+categoryName+":"+channelName+"'.", nil, "That message doesn't exist.")
		return
	}

	message := channel.History[index]

	reactionIndex := slices.IndexFunc(message.Reactions, func(react core.Reaction) bool {
		return react.From == user
	})

	if reactionIndex == -1 {
		w.WriteHeader(http.StatusBadRequest)
		core.WithToken(w, user, "(ERROR) User '"+user.Name+"' has not reacted to message #"+targetMessageIdString+".", nil, "You haven't reacted to this message.")
		return
	}

	message.Reactions = slices.Concat(message.Reactions[:reactionIndex], message.Reactions[reactionIndex+1:])

	core.WithToken(w, user, "(INFO) User '"+user.Name+"' removed their reaction from message #"+targetMessageIdString+" in channel '"+serverId+"/"+categoryName+":"+channelName+"'.", nil, "")
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

	if len(body.Content) == 0 && len(body.Attachments) == 0 {
		w.WriteHeader(http.StatusBadRequest)
		core.WithToken(w, user, "(ERROR) Message must have content or at least one attachment.", nil, "Messages need content or an attachment.")
		return
	}

	if len(body.Content) > 2048 {
		w.WriteHeader(http.StatusBadRequest)
		core.WithToken(w, user, "(ERROR) Message content exceeds 2048 character limit.", nil, "Message is too long (max 2048 characters).")
		return
	}

	if len(body.Attachments) > maxAttachments {
		w.WriteHeader(http.StatusBadRequest)
		core.WithToken(w, user, "(ERROR) Too many attachments (max 10).", nil, "Too many attachments (max 10).")
		return
	}

	for _, aid := range body.Attachments {
		if _, found := core.MediaItems[aid]; !found {
			w.WriteHeader(http.StatusBadRequest)
			core.WithToken(w, user, "(ERROR) Attachment '"+aid+"' not found.", nil, "One of your attachments couldn't be found.")
			return
		}
	}

	channel, err := core.ResolveChannel(serverId, categoryName, channelName, user)

	if err != nil {
		re := err.(core.ResolutionError)

		w.WriteHeader(re.Status())
		core.WithToken(w, user, "(ERROR) Could not resolve channel at path '"+serverId+"/"+categoryName+":"+channelName+"'; got resolution error '"+err.Error()+"'.", nil, "Could not find that channel.")

		return
	}

	var replyTarget *core.Message
	if body.ReplyTo != nil {
		idx := slices.IndexFunc(channel.History, func(m *core.Message) bool {
			return m.Id == *body.ReplyTo
		})
		if idx == -1 {
			w.WriteHeader(http.StatusNotFound)
			core.WithToken(w, user, "(ERROR) Reply target message #"+strconv.Itoa(*body.ReplyTo)+" not found in channel.", nil, "The message you're replying to doesn't exist.")
			return
		}
		replyTarget = channel.History[idx]
	}

	id := core.NextMessageId
	core.NextMessageId++

	message := &core.Message{
		From:        user,
		Content:     body.Content,
		Id:          id,
		Timestamp:   time.Now(),
		Attachments: body.Attachments,
		Reactions:   []core.Reaction{},
		RepliesTo:   replyTarget,
	}

	core.Messages = append(core.Messages, message)

	channel.History = slices.Concat([]*core.Message{message}, channel.History)

	w.WriteHeader(http.StatusCreated)
	core.WithToken(w, user, "(INFO) Message #"+strconv.Itoa(message.Id)+" from user '"+user.Name+"' created.", message.Id, "")
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
		core.WithToken(w, user, "(ERROR) Message ID '"+idString+"' could not be parsed.", nil, "Invalid message ID.")
		return
	}

	if len(body.Content) > 2048 {
		w.WriteHeader(http.StatusBadRequest)
		core.WithToken(w, user, "(ERROR) Message content exceeds 2048 character limit.", nil, "Message is too long (max 2048 characters).")
		return
	}

	channel, err := core.ResolveChannel(serverId, categoryName, channelName, user)

	if err != nil {
		re := err.(core.ResolutionError)

		w.WriteHeader(re.Status())
		core.WithToken(w, user, "(ERROR) Could not resolve channel '"+serverId+"/"+categoryName+":"+channelName+"'; got resolution error '"+err.Error()+"'.", nil, "Could not find that channel.")

		return
	}

	index := slices.IndexFunc(channel.History, func(message *core.Message) bool {
		return message.Id == id
	})

	if index == -1 {
		w.WriteHeader(http.StatusNotFound)
		core.WithToken(w, user, "(ERROR) Could not find message #"+idString+" from user '"+user.Name+"' in channel '"+serverId+"/"+categoryName+":"+channelName+"'.", nil, "That message doesn't exist.")
		return
	}

	message := channel.History[index]
	server := core.Servers[serverId]

	if user != message.From && user != server.Owner {
		w.WriteHeader(http.StatusUnauthorized)
		core.WithToken(w, user, "(ERROR) User '"+user.Name+"' is not authorized to edit message #"+idString+" from user '"+message.From.Name+"'.", nil, "You don't have permission to edit that message.")
		return
	}

	channel.History[index].Content = body.Content

	core.WithToken(w, user, "(INFO) Message #"+idString+" from user '"+user.Name+"' edited.", nil, "")
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
		core.WithToken(w, user, "(ERROR) Message ID '"+idString+"' could not be parsed.", nil, "Invalid message ID.")
		return
	}

	channel, err := core.ResolveChannel(serverId, categoryName, channelName, user)

	if err != nil {
		re := err.(core.ResolutionError)

		w.WriteHeader(re.Status())
		core.WithToken(w, user, "(ERROR) Could not resolve channel '"+serverId+"/"+categoryName+":"+channelName+"'; got resolution error '"+err.Error()+"'.", nil, "Could not find that channel.")

		return
	}

	index := slices.IndexFunc(channel.History, func(message *core.Message) bool {
		return message.Id == id
	})

	if index == -1 {
		w.WriteHeader(http.StatusNotFound)
		core.WithToken(w, user, "(ERROR) Could not find message #"+idString+" from user '"+user.Name+"' in channel '"+serverId+"/"+categoryName+":"+channelName+"'.", nil, "That message doesn't exist.")
		return
	}

	message := channel.History[index]
	server := core.Servers[serverId]

	if user != message.From && user != server.Owner {
		w.WriteHeader(http.StatusUnauthorized)
		core.WithToken(w, user, "(ERROR) User '"+user.Name+"' is not authorized to remove message #"+idString+" from user '"+message.From.Name+"'.", nil, "You don't have permission to delete that message.")
		return
	}

	channel.History = slices.Concat(channel.History[:index], channel.History[index+1:])

	if globalIdx := slices.Index(core.Messages, message); globalIdx != -1 {
		core.Messages = slices.Concat(core.Messages[:globalIdx], core.Messages[globalIdx+1:])
	}

	if userIdx := slices.Index(message.From.Messages, message); userIdx != -1 {
		message.From.Messages = slices.Concat(message.From.Messages[:userIdx], message.From.Messages[userIdx+1:])
	}

	core.WithToken(w, user, "(INFO) Message #"+idString+" from user '"+user.Name+"' removed.", nil, "")
}

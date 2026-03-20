package actions

import (
	"fmt"
	"net/http"
	"neutrino/core"
	"slices"
	"time"
)

func CreateUser(w http.ResponseWriter, r *http.Request) {
	username := r.PathValue("name")

	body, ok := core.MustParse[core.PassRequest](w, r)
	if !ok {
		return
	}

	if _, userAlreadyExists := core.Users[username]; userAlreadyExists {
		w.WriteHeader(http.StatusBadRequest)
		core.Tokenless(w, "(ERROR) User '"+username+"' already exists.", nil)
		return
	}

	user := core.User{
		Name:        username,
		Messages:    []*core.Message{},
		Token:       [32]byte{},
		LastRequest: time.Now(),
		Password:    core.HashPassword(body.Password),
	}

	core.Users[username] = &user

	w.WriteHeader(http.StatusCreated)
	core.Tokenless(w, "(INFO) User '"+username+"' created.", nil)
}

func RemoveUser(w http.ResponseWriter, r *http.Request) {
	body, ok := core.MustParse[core.RemoveUserRequest](w, r)
	if !ok {
		return
	}

	user, ok := core.GetUser(body.Username, body.Token, w)
	if !ok {
		return
	}

	if !core.CheckPassword(body.Password, user.Password) {
		w.WriteHeader(http.StatusUnauthorized)
		core.WithToken(w, user, "(ERROR) Incorrect password for user '"+body.Username+"'.", nil)
		return
	}

	var ownedServers []string
	for _, server := range core.Servers {
		if user == server.Owner {
			ownedServers = append(ownedServers, server.Name)
		}
	}

	if len(ownedServers) > 0 {
		w.WriteHeader(http.StatusBadRequest)
		core.WithToken(w, user, "(ERROR) User '"+user.Name+"' cannot be removed while owning servers "+fmt.Sprint(ownedServers)+".", nil)
		return
	}

	delete(core.Users, user.Name)

	for _, server := range core.Servers {
		serverIndex := slices.Index(server.Members, user)
		if serverIndex == -1 {
			continue
		}

		server.Members = slices.Concat(server.Members[:serverIndex], server.Members[serverIndex+1:])

		for _, category := range server.Categories {
			for _, channel := range category.Channels {
				channelIndex := slices.Index(channel.Members, user)

				if channelIndex == -1 {
					continue
				}

				channel.Members = slices.Concat(channel.Members[:channelIndex], channel.Members[channelIndex+1:])
			}
		}
	}

	w.WriteHeader(http.StatusOK)
	core.Tokenless(w, "(INFO) User '"+body.Username+"' removed.", nil)
}

func EditUser(w http.ResponseWriter, r *http.Request) {
	newUsername := r.PathValue("newname")

	body, ok := core.MustParse[core.SimpleRequest](w, r)
	if !ok {
		return
	}

	user, ok := core.GetUser(body.Username, body.Token, w)
	if !ok {
		return
	}

	if newUsername == user.Name {
		w.WriteHeader(http.StatusBadRequest)
		core.WithToken(w, user, "(ERROR) User '"+user.Name+"' already has username '"+newUsername+"'.", nil)
		return
	}

	if _, exists := core.Users[newUsername]; exists {
		w.WriteHeader(http.StatusConflict)
		core.WithToken(w, user, "(ERROR) Username '"+newUsername+"' is already taken.", nil)
		return
	}

	oldUsername := user.Name
	user.Name = newUsername

	delete(core.Users, oldUsername)
	core.Users[newUsername] = user

	core.WithToken(w, user, "(INFO) User '"+oldUsername+"' name changed to '"+user.Name+"'.", nil)
}

type ServerOrderRequest struct {
	Username string   `json:"username"`
	Token    [32]byte `json:"token"`
	Order    []string `json:"order"`
}

func SetServerOrder(w http.ResponseWriter, r *http.Request) {
	body, ok := core.MustParse[ServerOrderRequest](w, r)
	if !ok {
		return
	}

	user, ok := core.GetUser(body.Username, body.Token, w)
	if !ok {
		return
	}

	user.ServerOrder = body.Order

	core.WithToken(w, user, "(INFO) Server order updated for user '"+user.Name+"'.", nil)
}

func EditPassword(w http.ResponseWriter, r *http.Request) {
	body, ok := core.MustParse[core.EditPasswordRequest](w, r)
	if !ok {
		return
	}

	user, ok := core.GetUser(body.Username, body.Token, w)
	if !ok {
		return
	}

	if !core.CheckPassword(body.Password, user.Password) {
		w.WriteHeader(http.StatusUnauthorized)
		core.WithToken(w, user, "(ERROR) Incorrect password for user '"+user.Name+"'.", nil)
		return
	}

	if core.CheckPassword(body.NewPassword, user.Password) {
		w.WriteHeader(http.StatusBadRequest)
		core.WithToken(w, user, "(ERROR) New password must be different from current password.", nil)
		return
	}

	user.Password = core.HashPassword(body.NewPassword)

	core.WithToken(w, user, "(INFO) Password changed for user '"+user.Name+"'.", nil)
}

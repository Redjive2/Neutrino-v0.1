package actions

import (
	"net/http"
	"neutrino/core"
	"time"
)

func OpenSession(w http.ResponseWriter, r *http.Request) {
	username := r.PathValue("user")

	body, ok := core.MustParse[core.PassRequest](w, r)
	if !ok {
		return
	}

	user, found := core.Users[username]

	if !found {
		w.WriteHeader(http.StatusNotFound)
		core.Tokenless(w, "(ERROR) Could not find user '"+username+"'.", nil)
		return
	}

	if !core.CheckPassword(body.Password, user.Password) {
		w.WriteHeader(http.StatusUnauthorized)
		core.Tokenless(w, "(ERROR) Incorrect password for user '"+username+"'.", nil)
		return
	}

	user.LastRequest = time.Now()
	user.Active = true

	core.WithToken(w, user, "(INFO) Session opened for user '"+username+"'.", nil)
}

func CloseSession(w http.ResponseWriter, r *http.Request) {
	body, ok := core.MustParse[core.SimpleRequest](w, r)
	if !ok {
		return
	}

	user, found := core.Users[body.Username]

	if !found {
		w.WriteHeader(http.StatusNotFound)
		core.Tokenless(w, "(ERROR) Could not find user '"+body.Username+"'.", nil)
		return
	}

	valid := core.ValidateUser(user, w, body.Token)
	if !valid {
		return
	}

	user.Token = [32]byte{}
	user.Active = false

	core.Tokenless(w, "(INFO) Session closed for user '"+body.Username+"'.", nil)
}

package core

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type ServerResponse struct {
	Message        string   `json:"message"`
	Data           any      `json:"data"`
	NewToken       [32]byte `json:"newToken"`
	CarriesToken   bool     `json:"carriesToken"`
	UserMessage    string   `json:"userMessage"`
	HasUserMessage bool     `json:"hasUserMessage"`
}

func Tokenless(w http.ResponseWriter, message string, data any, userMessage string) {
	bytes, err := json.Marshal(ServerResponse{
		Message:        message,
		Data:           data,
		NewToken:       [32]byte{},
		CarriesToken:   false,
		UserMessage:    userMessage,
		HasUserMessage: userMessage != "",
	})

	if err != nil {
		fmt.Println("[" + fmt.Sprint(time.Now()) + "]  An INTERNAL ERROR occurred. Initial message: '" + message + "'; error message: '" + err.Error() + "'")
		return
	}

	fmt.Println("[" + fmt.Sprint(time.Now()) + "]  " + message)

	w.Header().Set("Content-Type", "application/json")
	w.Write(bytes)
}

func WithToken(w http.ResponseWriter, user *User, message string, data any, userMessage string) {
	token := NewToken()

	bytes, err := json.Marshal(ServerResponse{
		Message:        message,
		Data:           data,
		NewToken:       token,
		CarriesToken:   true,
		UserMessage:    userMessage,
		HasUserMessage: userMessage != "",
	})

	if err != nil {
		fmt.Println("[" + fmt.Sprint(time.Now()) + "]  An INTERNAL ERROR occurred. Initial message: '" + message + "'; error message: '" + err.Error() + "'")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	// Rotate token only after marshal succeeds, so a marshal failure
	// doesn't leave the user locked out with an undelivered token.
	user.PrevToken = user.Token
	user.Token = token

	fmt.Println("[" + fmt.Sprint(time.Now()) + "]  " + message)

	w.Header().Set("Content-Type", "application/json")
	w.Write(bytes)
}

package core

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type ServerResponse struct {
	Message      string   `json:"message"`
	Data         any      `json:"data"`
	NewToken     [32]byte `json:"newToken"`
	CarriesToken bool     `json:"carriesToken"`
}

func Tokenless(w http.ResponseWriter, message string, data any) {
	bytes, err := json.Marshal(ServerResponse{
		Message:      message,
		Data:         data,
		NewToken:     [32]byte{},
		CarriesToken: false,
	})

	if err != nil {
		fmt.Println("[" + fmt.Sprint(time.Now()) + "]  An INTERNAL ERROR occurred. Initial message: '" + message + "'; error message: '" + err.Error() + "'")
		return
	}

	fmt.Println("[" + fmt.Sprint(time.Now()) + "]  " + message)

	w.Write(bytes)
}

func WithToken(w http.ResponseWriter, user *User, message string, data any) {
	token := NewToken()

	user.Token = token

	bytes, err := json.Marshal(ServerResponse{
		Message:      message,
		Data:         data,
		NewToken:     token,
		CarriesToken: true,
	})

	if err != nil {
		fmt.Println("[" + fmt.Sprint(time.Now()) + "]  An INTERNAL ERROR occurred. Initial message: '" + message + "'; error message: '" + err.Error() + "'")
		return
	}

	fmt.Println("[" + fmt.Sprint(time.Now()) + "]  " + message)

	w.Write(bytes)
}

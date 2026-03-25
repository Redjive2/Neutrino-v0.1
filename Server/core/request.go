package core

import (
	"encoding/json"
	"io"
	"net/http"
)

type RemoveUserRequest struct {
	Username string   `json:"username"`
	Password string   `json:"password"`
	Token    [32]byte `json:"token"`
}

type SimpleRequest struct {
	Username string   `json:"username"`
	Token    [32]byte `json:"token"`
}

type PassRequest struct {
	Password string `json:"password"`
}

type EditPasswordRequest struct {
	Username    string   `json:"username"`
	Password    string   `json:"password"`
	Token       [32]byte `json:"token"`
	NewPassword string   `json:"newPassword"`
}

const maxBodySize = 1 << 20 // 1 MB

func Parse[T any](r *http.Request) (T, error) {
	var body T

	bytes, err := io.ReadAll(io.LimitReader(r.Body, maxBodySize))
	if err != nil {
		return body, err
	}

	if err := json.Unmarshal(bytes, &body); err != nil {
		return body, err
	}

	return body, nil
}

// MustParse parses the request body into T. On failure, writes a 400 response
// and returns the zero value with ok=false.
func MustParse[T any](w http.ResponseWriter, r *http.Request) (T, bool) {
	body, err := Parse[T](r)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		Tokenless(w, "(ERROR) Malformed request body: "+err.Error(), nil, "The request was malformed or incomplete.")
		return body, false
	}
	return body, true
}

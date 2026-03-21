package core

import (
	"crypto/rand"
	"crypto/subtle"
	"net/http"
	"time"

	"golang.org/x/crypto/bcrypt"
)

func NewToken() [32]byte {
	var token [32]byte
	if _, err := rand.Read(token[:]); err != nil {
		panic("crypto/rand failed: " + err.Error())
	}
	return token
}

func HashPassword(password string) string {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		panic("bcrypt failed: " + err.Error())
	}
	return string(hash)
}

func CheckPassword(password, hash string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) == nil
}

func GetUser(username string, token [32]byte, w http.ResponseWriter) (*User, bool) {
	user, found := Users[username]

	if !found {
		w.WriteHeader(http.StatusNotFound)
		Tokenless(w, "(ERROR) Could not find user '"+username+"'.", nil)
		return nil, false
	}

	ok := ValidateUser(user, w, token)
	if !ok {
		return nil, false
	}

	return user, true
}

func ValidateUser(user *User, w http.ResponseWriter, token [32]byte) bool {
	if !user.Active {
		w.WriteHeader(http.StatusUnauthorized)
		Tokenless(w, "(ERROR) User '"+user.Name+"' is not in an active session.", nil)
		return false
	}

	empty := [32]byte{}
	matchesCurrent := subtle.ConstantTimeCompare(token[:], user.Token[:]) == 1
	matchesPrev    := subtle.ConstantTimeCompare(token[:], user.PrevToken[:]) == 1
	isEmpty        := subtle.ConstantTimeCompare(token[:], empty[:]) == 1

	if !matchesCurrent && (isEmpty || !matchesPrev) {
		w.WriteHeader(http.StatusUnauthorized)
		Tokenless(w, "(ERROR) Invalid token provided.", nil)
		return false
	}

	if time.Since(user.LastRequest) > 10*time.Minute {
		w.WriteHeader(http.StatusUnauthorized)
		Tokenless(w, "(ERROR) Session timed out for user '"+user.Name+"'.", nil)

		user.Token = [32]byte{}
		user.Active = false

		return false
	}

	user.LastRequest = time.Now()

	return true
}

package core

import (
	"crypto/rand"
	"crypto/sha256"
	"crypto/subtle"
	"net/http"
	"time"

	"golang.org/x/crypto/bcrypt"
)

// HashToken returns the SHA-256 hash of a session token.
func HashToken(token [32]byte) [32]byte {
	return sha256.Sum256(token[:])
}

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
		Tokenless(w, "(ERROR) Could not find user '"+username+"'.", nil, username + " does not exist.")
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
		Tokenless(w, "(ERROR) User '"+user.Name+"' is not in an active session.", nil, user.Name + " is not logged in.")
		return false
	}

	empty := [32]byte{}
	matchesCurrent := subtle.ConstantTimeCompare(token[:], user.Token[:]) == 1
	matchesPrev    := subtle.ConstantTimeCompare(token[:], user.PrevToken[:]) == 1
	isEmpty        := subtle.ConstantTimeCompare(token[:], empty[:]) == 1

	if !matchesCurrent && (isEmpty || !matchesPrev) {
		w.WriteHeader(http.StatusUnauthorized)
		Tokenless(w, "(ERROR) Invalid token provided.", nil, "Your session token is invalid. Try logging in again.")
		return false
	}

	if time.Since(user.LastRequest) > 60*time.Minute {
		w.WriteHeader(http.StatusUnauthorized)
		Tokenless(w, "(ERROR) Session timed out for user '"+user.Name+"'.", nil, "The session timed out.")

		user.Token = [32]byte{}
		user.Active = false

		return false
	}

	user.LastRequest = time.Now()

	return true
}

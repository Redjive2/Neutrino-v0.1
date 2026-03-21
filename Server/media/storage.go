package media

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
)

const (
	MaxFileSize = 10 << 20 // 10 MB
	Dir         = "data/media"
)

var (
	idPattern    = regexp.MustCompile(`^[0-9a-f]{32}$`)
	AllowedTypes = map[string]bool{
		"image/png":  true,
		"image/jpeg": true,
		"image/gif":  true,
		"image/webp": true,
		"video/mp4":  true,
		"video/webm": true,
	}
)

// EnsureDir creates the media storage directory if it doesn't exist.
func EnsureDir() error {
	return os.MkdirAll(Dir, 0755)
}

// NewID generates a 32-character hex ID from 16 random bytes.
func NewID() (string, error) {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

// ValidateID checks that an ID is exactly 32 lowercase hex characters.
func ValidateID(id string) bool {
	return idPattern.MatchString(id)
}

// DetectType sniffs the content type from the first 512 bytes and checks
// it against the allowed whitelist. Returns the MIME type and whether it's allowed.
func DetectType(data []byte) (string, bool) {
	mime := http.DetectContentType(data)
	return mime, AllowedTypes[mime]
}

func pathFor(id string) string {
	return filepath.Join(Dir, id+".bin")
}

// Save writes data to disk atomically (tmp + rename).
func Save(id string, data []byte) error {
	if !ValidateID(id) {
		return errors.New("invalid media ID")
	}

	path := pathFor(id)
	tmp := path + ".tmp"

	if err := os.WriteFile(tmp, data, 0644); err != nil {
		os.Remove(tmp)
		return err
	}

	return os.Rename(tmp, path)
}

// Load reads a media file from disk.
func Load(id string) ([]byte, error) {
	if !ValidateID(id) {
		return nil, errors.New("invalid media ID")
	}
	return os.ReadFile(pathFor(id))
}

// Delete removes a media file from disk.
func Delete(id string) error {
	if !ValidateID(id) {
		return errors.New("invalid media ID")
	}
	return os.Remove(pathFor(id))
}

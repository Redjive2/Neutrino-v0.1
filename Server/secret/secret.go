package secret

import (
	"os"
	"strings"
)

var SupervisorPassword string

func Load(path string) error {
	data, err := os.ReadFile(path)
	if err != nil {
		return err
	}
	SupervisorPassword = strings.TrimSpace(string(data))
	return nil
}

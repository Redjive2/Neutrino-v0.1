//go:build !windows

package secret

import (
	"os"
	"strings"
)

var SupervisorPassword string

func Load() error {
	data, err := os.ReadFile("~/neutrino_admin_pass.key")
	if err != nil {
		return err
	}
	SupervisorPassword = strings.TrimSpace(string(data))
	return nil
}
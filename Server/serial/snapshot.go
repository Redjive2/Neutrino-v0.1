package serial

import (
	"fmt"
	"neutrino/core"
	"os"
	"time"
)

// lockedSaveTo acquires the global mutex before saving.
func lockedSaveTo(path string) error {
	core.Mu.Lock()
	defer core.Mu.Unlock()
	return saveTo(path)
}

func log(msg string) {
	fmt.Println("[" + fmt.Sprint(time.Now()) + "]  " + msg)
}

// saveTo writes a snapshot to the given path atomically (write tmp, then rename).
func saveTo(path string) error {
	tmp := path + ".tmp"

	f, err := os.Create(tmp)
	if err != nil {
		return err
	}

	if err := Serialize(f); err != nil {
		f.Close()
		os.Remove(tmp)
		return err
	}

	if err := f.Sync(); err != nil {
		f.Close()
		os.Remove(tmp)
		return err
	}

	f.Close()
	return os.Rename(tmp, path)
}

// LoadFrom restores state from a snapshot file. Returns false if the file doesn't exist.
func LoadFrom(path string) (bool, error) {
	f, err := os.Open(path)
	if err != nil {
		if os.IsNotExist(err) {
			return false, nil
		}
		return false, err
	}
	defer f.Close()

	if err := Deserialize(f); err != nil {
		return false, err
	}

	return true, nil
}

// SnapshotAndTrim saves all data to the given path, then trims each channel's
// in-memory history to the most recent MaxChannelHistory messages.
func SnapshotAndTrim(path string) {
	if err := saveTo(path); err != nil {
		log("Mutation-triggered snapshot FAILED: " + err.Error())
	} else {
		log("Mutation-triggered snapshot saved to " + path)
	}

	core.TrimChannelHistories()
	log("Trimmed channel histories to " + fmt.Sprint(core.MaxChannelHistory) + " messages each.")

	core.Dirty = false
	core.MutationCount = 0
}

// StartAutoSnapshot runs in the background. It saves to primaryPath every 5 minutes
// (only if data changed), and copies to backupPath every hour.
func StartAutoSnapshot(primaryPath, backupPath string) {
	primaryTicker := time.NewTicker(5 * time.Minute)
	backupTicker := time.NewTicker(1 * time.Hour)

	go func() {
		for {
			select {
			case <-primaryTicker.C:
				core.Mu.Lock()
				if !core.Dirty {
					core.Mu.Unlock()
					continue
				}
				core.Dirty = false
				err := saveTo(primaryPath)
				core.Mu.Unlock()

				if err != nil {
					log("Snapshot FAILED: " + err.Error())
				} else {
					log("Snapshot saved to " + primaryPath)
				}

			case <-backupTicker.C:
				if err := lockedSaveTo(backupPath); err != nil {
					log("Backup FAILED: " + err.Error())
				} else {
					log("Backup saved to " + backupPath)
				}
			}
		}
	}()
}

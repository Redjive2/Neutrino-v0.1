package main

import (
	"fmt"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"runtime"
	"syscall"
	"time"
)

const (
	updateExitCode = 2
	minDelay       = 2 * time.Second
	maxDelay       = 60 * time.Second
)

var port string

func log(msg string) {
	fmt.Println("[" + time.Now().Format(time.DateTime) + "]  " + msg)
}

func binName(base string) string {
	if runtime.GOOS == "windows" {
		return base + ".exe"
	}
	return base
}

func resolveDir() (serverDir, repoRoot string) {
	exe, err := os.Executable()
	if err != nil {
		log("FATAL: could not determine executable path: " + err.Error())
		os.Exit(1)
	}

	base := filepath.Dir(exe)
	return filepath.Join(base, "..", "Server"), filepath.Dir(base)
}

func build(dir string) error {
	log("Building server...")

	tmp := binName("server_tmp")
	cmd := exec.Command("go", "build", "-o", tmp)
	cmd.Dir = dir
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Run(); err != nil {
		os.Remove(filepath.Join(dir, tmp))
		return err
	}

	target := binName("server")
	old := filepath.Join(dir, target)
	built := filepath.Join(dir, tmp)

	bak := old + ".bak"
	os.Remove(bak)

	if err := os.Rename(old, bak); err != nil {
		// Old binary may not exist on first build.
		if !os.IsNotExist(err) {
			log("WARNING: could not rename old binary: " + err.Error())
		}
	}

	if err := os.Rename(built, old); err != nil {
		os.Rename(bak, old)
		return fmt.Errorf("swap failed: %w", err)
	}

	os.Remove(bak)
	return nil
}

func gitPull(dir string) error {
	log("Pulling latest changes...")
	cmd := exec.Command("git", "pull")
	cmd.Dir = dir
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	return cmd.Run()
}

func run(dir string) int {
	binary := filepath.Join(dir, binName("server"))
	cmd := exec.Command(binary, port)
	cmd.Dir = dir
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, os.Interrupt, syscall.SIGTERM)

	if err := cmd.Start(); err != nil {
		log("ERROR: could not start server: " + err.Error())
		signal.Stop(sigCh)
		return 1
	}

	done := make(chan struct{})

	if runtime.GOOS != "windows" {
		go func() {
			select {
			case sig, ok := <-sigCh:
				if ok && cmd.Process != nil {
					cmd.Process.Signal(sig)
				}
			case <-done:
			}
		}()
	}

	err := cmd.Wait()
	signal.Stop(sigCh)
	close(done)

	if err != nil {
		if exitErr, ok := err.(*exec.ExitError); ok {
			return exitErr.ExitCode()
		}
		log("ERROR: " + err.Error())
		return 1
	}

	return 0
}

func main() {
	if len(os.Args) != 2 {
		panic("'1' argument expected (var port string); got '" + fmt.Sprint(len(os.Args)) + "'.")
	}

	port = os.Args[1]
	dir, root := resolveDir()

	log("Supervisor started.")
	log("Server directory: " + dir)
	log("Repo root: " + root)

	if err := build(dir); err != nil {
		log("FATAL: initial build failed: " + err.Error())
		os.Exit(1)
	}

	delay := minDelay

	for {
		log("Starting server...")
		start := time.Now()
		code := run(dir)

		switch code {
		case 0:
			log("Server exited cleanly.")
			return

		case updateExitCode:
			log("Update requested.")
			delay = minDelay

			if err := gitPull(root); err != nil {
				log("WARNING: git pull failed: " + err.Error())
				log("Skipping rebuild, restarting existing binary...")
				continue
			}

			if err := build(dir); err != nil {
				log("ERROR: rebuild failed: " + err.Error())
				log("Restarting old binary...")
			}

		default:
			// Reset backoff if the server ran for a while before crashing.
			if time.Since(start) > maxDelay {
				delay = minDelay
			}

			log(fmt.Sprintf("Server crashed (exit code %d). Restarting in %s...", code, delay))
			time.Sleep(delay)

			delay *= 2
			if delay > maxDelay {
				delay = maxDelay
			}
		}
	}
}

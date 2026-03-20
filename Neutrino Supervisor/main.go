package main

import (
	"fmt"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"
)

const (
	updateExitCode = 2
	minDelay       = 2 * time.Second
	maxDelay       = 60 * time.Second
)

func log(msg string) {
	fmt.Println("[" + time.Now().Format(time.DateTime) + "]  " + msg)
}

func resolveDir() (serverDir, repoRoot string) {
	exe, err := os.Executable()
	if err != nil {
		log("FATAL: could not determine executable path: " + err.Error())
		os.Exit(1)
	}

	base := filepath.Dir(exe)
	return filepath.Join(base, "..", "Neutrino Server"), filepath.Dir(base)
}

func build(dir string) error {
	log("Building server...")
	cmd := exec.Command("go", "build")
	cmd.Dir = dir
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	return cmd.Run()
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
	binary := filepath.Join(dir, "neutrino.exe")
	cmd := exec.Command(binary)
	cmd.Dir = dir
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)

	if err := cmd.Start(); err != nil {
		log("ERROR: could not start server: " + err.Error())
		signal.Stop(sigCh)
		return 1
	}

	go func() {
		sig, ok := <-sigCh
		if ok && cmd.Process != nil {
			cmd.Process.Signal(sig)
		}
	}()

	err := cmd.Wait()
	signal.Stop(sigCh)
	close(sigCh)

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
			}

			if err := build(dir); err != nil {
				log("ERROR: rebuild failed: " + err.Error())
				log("Restarting old binary...")
			}

		default:
			log(fmt.Sprintf("Server crashed (exit code %d). Restarting in %s...", code, delay))
			time.Sleep(delay)

			delay *= 2
			if delay > maxDelay {
				delay = maxDelay
			}
		}
	}
}

#!/bin/bash

if [[ $1 == "" ]]; then
    echo "Use './make help' to see options."
    exit 0
fi

if [[ $1 == "help" ]]; then
    echo "[----------------------------------------------------------------------------------------------------]"
    echo "| ./make: Neutrino build helper                                                                      |"
    echo "| -----------------------------                                                                      |"
    echo "| -> clean            : Remove all build artifacts.                                                  |"  
    echo "| -> commit           : Add, commit, and push Neutrino to Github, then update the remote supervisor. |"
    echo "| -> build            : Build the server and supervisor for the current environment.                 |"
    echo "| -> serve     <port> : Build and run just the server for the current env. on the port given.        |"
    echo "| -> supervise <port> : Build and run the supervisor for the current env. on the port given.         |"
    echo "| -> pull             : Runs git stash & git pull.                                                   |"
    echo "| -> update           : Updates the remote supervisor.                                               |"
    echo "[----------------------------------------------------------------------------------------------------]"
    exit 0
fi

if [[ $1 == "clean" ]]; then
    rm ./Server/server
    rm ./Server/server_tmp
    rm ./Supervisor/supervisor
    exit 0
fi

if [[ $1 == "commit" ]]; then
  git add .
  git commit -m "$2"
  git push
  sleep 3s
  curl -X POST https://neutrino.two-mortons.uk/supervisor/doupdate -H "Content-Type: application/json" -d "{\"password\": \"$(cat ~/neutrino_admin_pass.key)\"}"
  exit 0
fi

if [[ $1 == "build" ]]; then
    cd Server && go build -o server && cd ..
    cd Supervisor && go build -o supervisor && cd ..
    exit 0
fi

if [[ $1 == "serve" ]]; then
    cd Server
    go build -o server
    ./server $2
    exit 0
fi

if [[ $1 == "supervise" ]]; then
    cd Supervisor
    go build -o supervisor
    ./supervisor $2
    exit 0
fi

if [[ $1 == "pull" ]]; then
    git stash
    git pull
    exit 0
fi

if [[ $1 == "update" ]]; then
    curl -X POST https://neutrino.two-mortons.uk/supervisor/doupdate -H "Content-Type: application/json" -d "{\"password\": \"$(cat ~/neutrino_admin_pass.key)\"}"
    exit 0
fi

echo "'$1' is not a valid subcommand. Use './make help' for a list of subcommands."

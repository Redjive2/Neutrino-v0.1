#!/bin/bash

if [[ $1 == "clean" ]]; then
    rm ./Server/server
    rm ./Supervisor/supervisor
    exit 0
fi

if [[ $1 == "commit" ]]; then
  git add .
  git commit -m "$2"
  git push
  exit 0
fi

cd Server && go build -o server && cd ..
cd Supervisor && go build -o supervisor && cd ..

if [[ $1 == "serve" ]]; then
    ./Server/server
fi

if [[ $1 == "supervise" ]]; then
    ./Supervisor/supervisor
fi
    
# Neutrino

Welcome to the Neutrino codebase! This README is very minimal for now, but will be expanded upon later. For now, it's broken into two sections: *Project Structure* and *Build, Run, Update*.

## Project Structure

The project structure is as follows:

- `/Site`:       A website containing the entire frontend. Fairly minimal for now; served from /Server. The codebase is described in `/Site/Site Structure.txt`.
- `/Server`:     A Go project containing the entire backend, including the data store. The API is detailed at `/Server/api.txt`.
- `/Supervisor`: A Go project containing the server's supervisor. This builds and starts the server, restarts it if it crashes, and updates it from Github when the endpoint `/supervisor/doupdate` is called with the appropriate admin password. Its codebase is simple enough that it does not have any documentation file.

## Build, Run, Update

To build, simply:
- Install the latest version of Go
- Install the latest version of Bash
- Run `./make build` to build both the server and supervisor

And to run:
- \[Just the server] Run `./Server/server <port>` or `./make serve <port>` (which builds the server first)
- \[Everything] Run `./Supervisor/supervisor <port>` or `./make supervise <port>` (which builds the supervisor first)

Finally, to update it:
- Run `./make clean` to remove unwanted build artifacts
- Run `./make commit <message>` to publish changes to github and update the remote supervisor

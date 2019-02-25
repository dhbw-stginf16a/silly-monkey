# Trigger Router for Silly Monkey

## Developing
1. Install prerequisites or launch `nix-shell`.
2. Start webserver with `./start.sh`

## Deployment
Build container and run it:

```
docker build -t trigger-router .
docker run -p 5000:5000 --rm trigger-router
```

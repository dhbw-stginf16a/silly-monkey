# Silly Monkey PDA

Documentation is in the Wiki

## Prerequisites
- Docker
- docker-compose
- A linux kernel (using a VM on Windows or Mac)

### On Windows without Hyper-V
You can use other providers like [VMware](https://github.com/pecigonzalo/docker-machine-vmwareworkstation) instead.
See the documentation for Docker Machine for more info.

## Developing
I aliased `docker-compose` to `dc` and I recommend you to do the same because you're going to be typing it a lot.

| Description                        | Command                           |
| ---------------------------------- | --------------------------------- |
| Pull everything                    | `dc pull`                         |
| Building everything                | `dc -d build`                     |
| Start everything                   | `dc -d up`                        |
| Rebuild and start everything       | `dc -d up --build`                |
| View running containers            | `dc ps`                           |
| Stop everything                    | `dc down`                         |
|                                    |                                   |
| Pull single container              | `dc pull sm-container-name`       |
| Rebuild and start single container | `dc up -d --build container-name` |
| View logs of single container      | `dc logs -f container-name`       |
| Stop single container              | `dc down container-name`          |

The containers are written so that they can be rebuilt really fast if only the
code changes. So you should rebuild and restart a container if you change its
code and want to run it.

Only the `trigger-router` is accessible from the outside at `localhost:2015`
(or the IP adress of your Docker VM in case of VMware or another drive).

The containers can reach eachother at their hostname and port: `http://container-name:50xx/endpoint`.

A new microservice has to have a `Dockerfile` and be added to
`docker-compose.yml`. Please look at the existing containers for how to do
this.

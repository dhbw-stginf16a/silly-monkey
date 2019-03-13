# Silly Monkey PDA

Documentation is in the Wiki

## Prerequisites
- Docker
- docker-compose
- A linux kernel (using a VM on Windows or Mac)

### On Windows without Hyper-V
You can use other providers like [VMware](https://github.com/pecigonzalo/docker-machine-vmwareworkstation) instead.
See the documentation for Docker Machine for more info.

## Docker-Compose
I aliased `docker-compose` to `dc` and I recommend you to do the same because you're going to be typing it a lot.

Useful commands:

| Description                        | Command                           |
| ---------------------------------- | --------------------------------- |
| Pull everything                    | `dc pull`                         |
| Building everything                | `dc build`                        |
| Start everything                   | `dc up -d`                        |
| Rebuild and start everything       | `dc up -d --build`                |
| View running containers            | `dc ps`                           |
| Stop everything                    | `dc down`                         |
|                                    |                                   |
| Pull single container              | `dc pull sm-container-name`       |
| Rebuild and start single container | `dc up -d --build service-name`   |
| View logs of single container      | `dc logs -f service-name`         |
| Stop single container              | `dc down service-name`            |

Docker terminology:

| Term | Explanation |
| ---- | ----------- |
| Pull a container     | Download it from DockerHub                                             |
| Push a container     | Upload it to DockerHub                                                 |
| Build a container    | Install dependencies into container and include files                  |
| Dockerfile           | The file describing how to build the container                         |
| `docker-compose`     | Tool used to combine multiple containers together                      |
| Service              | `docker-compose` handles services which it does by managing containers |
| `ps`                 | Literally "process status" - show status of services/containers        |
| `docker-compose.yml` | The file describing which services run which containers on which ports |

You only need to pull a container when you don't want to change and build it
yourself but only download it. When you pull it, you get the most recent build
that travis did.


## Developing
The containers are written so that they can be rebuilt really fast if only the
code changes. So you should rebuild and restart a container if you change its
code and want to run it.

Only the `trigger-router` is accessible from the outside at `localhost:2015`
(or the IP adress of your Docker VM in case of VMware or another drive).
Actually in the development environment the other services are also available
at localhost with their respective port so that you don't have to go throught
the trigger router for debugging a single container.

The containers can reach eachother at their hostname and port: `http://container-name:50xx/endpoint`.

A new microservice has to have a `Dockerfile` and be added to
`docker-compose.yml`. Please look at the existing containers for how to do
this.

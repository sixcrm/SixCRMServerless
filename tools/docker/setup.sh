#!/usr/bin/env bash
docker-machine start default
eval "$(docker-machine env default)"
docker-compose --file tools/docker/docker-compose.yml up -d
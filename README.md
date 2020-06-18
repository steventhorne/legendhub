# [LegendHUB](https://www.legendhub.org)
> A resource hub for [LegendMUD](www.legendmud.org).

[![Version v=2.2.7](http://img.shields.io/badge/version-v=2.2.7-brightgreen.svg?style=flat-square)](https://www.legendhub.org) [![License](http://img.shields.io/:license-mit-blue.svg?style=flat-square)](http://badges.mit-license.org)

## Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)

## Prerequisites
> This repo requires certain software in order to be deployed and run. This software will make it a lot easier to work with legendhub.

- Download and install [Docker](https://www.docker.com/) for your system.
- Download and install [Docker Compose](https://docs.docker.com/compose/install/) for your system.
- If you are using Docker Desktop edition, make sure to add the repository's directory to the File Sharing list in Docker's Settings -> Resources -> File Sharing.

## Installation
> This repo contains a simple to use install process which assumes you have an HTTP server setup on that system.

- Navigate to the directory where you've downloaded the legendhub repository.
- Copy the `.env_example` and rename it to `.env`.
- Replace the dummy data in `.env` with your desired environment variables.
- Run `docker-compose up` or `docker-compose up -d` to run it in detached mode.
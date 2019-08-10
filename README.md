# [LegendHUB](https://www.legendhub.org)
> A resource hub for [LegendMUD](www.legendmud.org).

[![Version v=2.0.2](http://img.shields.io/badge/version-v=2.0.2-brightgreen.svg?style=flat-square)](https://www.legendhub.org) [![License](http://img.shields.io/:license-mit-blue.svg?style=flat-square)](http://badges.mit-license.org)

## Table of Contents
- [Not Included](#not-included)
- [Installation](#installation)
- [Building and Deploying](#building-and-deploying)
- [Sql Database Backup](#sql-database-backup)

## Not Included
> This repo does not include everything that [legendhub.org](https://www.legendhub.org) currently accomplishes. You are responsible for setting these systems up if you want them.

The following are not included:
- Web server config (apache2/nginx)
- SSL certificate creation/renewal process
- An automatic mysql backup process
- A schedule for creating new notifications. The python app only processes the notification queue once before exiting, you are responsible for running it on a schedule.
- A connection to the sql database is not provided, though the backup for a mysql database **is** included and can be used to host your own database (accounts and their settings are not included in this backup - new accounts will need to be created).

## Installation
> This repo contains a simple to use install process which assumes you have an HTTP server setup on that system.

- [Download and install Node.js](https://nodejs.org/en/download/) - Used for installing dependencies.
- [Download and install the latest version of Python 3](https://www.python.org/downloads/) - Used for the notification process.
- Clone this repo to your local machine using `git clone https://github.com/SvarturH/legendhub.git`
- Navigate to the root directory of the cloned repo and run `npm install` to install the necessary dependencies.
- This will create the following file:
    - .env
    - python/sql/sql_engine_config.py
- Replace the default values in the config files with your sql database information.

## Building and Deploying
- Run `npm run build` to build all of the projects.
- To build each project individually run the following commands:
    - `npm run build:python`
    - `npm run build:css`
- Building the css project will copy the new css files to the www directory. This is only necessary if you make changes to the CSS project, as the web project already has the latest CSS.
- Once everything is built, simply run `npm start` or `npm start-dev` to run the project in production or development mode.
- The project will now be listening on the port provided in the .env file.

## Sql Database Backup
- The latest backup file can be downloaded from [here](https://drive.google.com/open?id=17RJ2vnmmH4G4-DWjlvEBYX-UI8I5RgC5).
- Use the following command to import the backup:
    - `mysql –u[user name] -p[password] -h[hostname] [database name] < [path-to-file].sql`

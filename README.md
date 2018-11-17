# [LegendHUB](https://www.legendhub.org)
> A resource hub for [LegendMUD](www.legendmud.org).

[![Version 1.5.1](http://img.shields.io/badge/version-1.5.1-brightgreen.svg?style=flat-square)](https://www.legendhub.org) [![License](http://img.shields.io/:license-mit-blue.svg?style=flat-square)](http://badges.mit-license.org)

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
- Run `npm run prepare` - this will create two files:
- www/php/common/config.php
- python/sql/sql_engine_config.py
- Replace the default values in the config files with your sql database information.
- Open the package.json file and replace the `webdevdir` and `webproddir` config values with the absolute or relative paths of your deployment directories. (Where your HTTP server expects your web files to be placed)

## Building and Deploying
- Run `npm run build` to build all of the projects.
- This will deploy the web project to the `webdevdir` directory, as well.
- If you want to deploy to the `webproddir` directory, you must run `npm run build:web:deploy-prod` after building.
- To build each project individually run the following commands:
    - `npm run build:web`
    - `npm run build:python`
    - `npm run build:css`
- Building the css project will copy the new css files to the www directory. You must run `npm run build:web` **afterwards** in order for your new css files to be included in the web build. `npm run build` will automatically build the projects in the correct order.

## Sql Database Backup
- The latest backup file can be downloaded from [here](https://drive.google.com/open?id=17RJ2vnmmH4G4-DWjlvEBYX-UI8I5RgC5).
- Unzip the file and use the following command to import the backup.
- `mysql –u[user name] -p[password] -h[hostname] [database name] < [path-to-file].sql`

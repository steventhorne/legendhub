# [LegendHUB](https://www.legendhub.org)
> A resource hub for [LegendMUD](www.legendmud.org).

[![Version 1.5.1](http://img.shields.io/badge/version-1.5.1-brightgreen.svg?style=flat-square)](https://www.legendhub.org) [![License](http://img.shields.io/:license-mit-blue.svg?style=flat-square)](http://badges.mit-license.org)

## Table of Contents
- [Not Included](#not-included)
- [Installation](#installation)

## Not Included
> This repo does not include everything that [legendhub.org](https://www.legendhub.org) currently accomplishes. You are responsible for setting these systems up if you want them.
The following is not included:
- Web server config (apache2/nginx)
- SSL certificate creation/renewal process
- Automatic mysql backup process
- Bootstrap build process
    - The site makes use of Bootstrap CSS framework
    - The www/css/themes folder contains custom bootstrap styles
        - The _*-theme.scss files include _variables.scss overrides for each theme
        - The _custom.scss contains custom css that is also built with bootstrap
    - You must manually build bootstrap with these files to update bootstrap or the themes
        - More can be found [here](https://getbootstrap.com/docs/4.1/getting-started/build-tools/)

## Installation
> This repo contains a simple to use install process on linux assuming you have an HTTP server setup on that system.
- Clone this repo to your local machine using `https://github.com/SvarturH/legendhub.git`
- Create the php config file
    - Navigate to www/php/common/ and copy the config-example.php to config.php
    - Replace the temp variables inside the file with the connection info for your mysql server
- Run the deploy.sh script using `bash deploy.sh` or `./deploy.sh`
    - Verify that you created the config.php
    - Specify the directory you want to deploy to

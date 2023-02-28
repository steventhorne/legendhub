# [LegendHUB](https://www.legendhub.org)
> A resource hub for [LegendMUD](www.legendmud.org).

[![Version v=2.5.0](https://img.shields.io/badge/version-v=2.5.0-brightgreen.svg?style=flat-square)](https://www.legendhub.org) [![License](https://img.shields.io/:license-mit-blue.svg?style=flat-square)](https://badges.mit-license.org)

## Table of Contents
* [Prerequisites](#prerequisites)
* [Installation](#installation)
* [Tech Stack](#tech-stack)
  + [Website Server-Side Code](#website-server-side-code)
  + [Website Client-Side Code](#website-client-side-code)
  + [CSS](#css)
  + [Database](#database)
  + [Services](#services)
* [Maintenance](#maintenance)
  + [Backups](#backups)
  + [Updating the Builder](#updating-the-builder)
	- [Updating Stat Formulas](#updating-stat-formulas)
  + [Updating Code](#updating-code)
  + [Updating CSS](#updating-css)
  + [Permissions](#permissions)
  + [Updating SQL Data](#updating-sql-data)
  + [Adding New Areas](#adding-new-areas)
  + [Adding a New Stat](#adding-a-new-stat)
	- [Type](#type)
	- [FilterString](#filterstring)
  * [TODO List](#todo-list)

## Prerequisites
> This repo requires certain software in order to be deployed and run. This software will make it a lot easier to work with legendhub.

* Download and install [Docker](https://www.docker.com) for your system.
* Download and install [Docker Compose](https://docs.docker.com/compose/install/) for your system.
* If you are using Docker Desktop edition, make sure to add the repository's directory to the File Sharing list in Docker's Settings -> Resources -> File Sharing.
* Ensure you have a reCAPTCHA account and site.
    * The type of reCAPTCHA is reCAPTCHA v2 checkbox.
    * This is required for the login and feedback pages.
    * Can probably be omitted if the reCAPTCHA elements are removed from those pages.
* Ensure you have a github account as well as repository and token keys for authenticating.
    * This is required for the feedback page.
    * Can probably be omitted if the feedback page is removed.

## Installation
> This repo contains a simple to use install process which assumes you have an HTTP server setup on that system.

* Navigate to the directory where you've downloaded the [repository](https://github.com/steventhorne/legendhub/)
* Copy the `.env_example` and rename it to `.env`
* Replace the dummy data in `.env` with your desired environment variables
* If you have a backup sql script, simply place this file in the mysql directory before building the images for the first time
    * This backup file must be named `backup.sql`
    * If you do not provide a backup script, it will try to use a public backup which may be outdated or deleted, as it points to Stolve's Google Drive
    * The location for this fallback backup script can be modified in the `mysql/entrypoint.sh` file on line `39`
    * If you need to clear out the database and use a new backup script, the image and volumes need to be deleted before rebuilding again.
* Run `docker-compose up` or `docker-compose compose up -d` to run in detached mode
* This will start up three containers. A MYSQL container for database storage, a web container for the actual website, and a python container which handles routine maintenance and notifications

## Tech Stack
> The following is a brief overview of the LegendHUB technical stack.

### Website Server-Side Code
For the server-side code, [Node.js](https://nodejs.org/en/) is used alongside [Express](https://expressjs.com/) middleware using JavaScript.

This server-side code also uses [compression](https://www.npmjs.com/package/compression), [path](https://nodejs.org/api/path.html), [cookie-parser](https://www.npmjs.com/package/cookie-parser), and [morgan](https://www.npmjs.com/package/morgan) as middleware.

ExpressJS is used to take care of routing requests to the route handlers as well as the API.

The API is a [GraphQL](https://graphql.org/) API that runs in the same instance as the rest of the web server.

There is also a custom authentication middleware to handle authenticating every request.

[EJS](https://ejs.co/) is used for view templating.

### Website Client-Side Code
[AngularJS v1.x](https://angularjs.org/) is used for the client-side code. This framework is outdated and has entered LTS. This should not be a huge issue and there are [alternatives](https://xlts.dev/angularjs).

Most of this AngularJS code is in the `www/src/public/js` directory under `apps` or `controllers`, though there is still some lingering code that exists in the views. See TODO List.

### CSS
Bootstrap is used as the primary CSS tool. Bootstrap and custom bootstrap styles are written in [SCSS](https://sass-lang.com/).

### Database
[MySQL](https://www.mysql.com/) is used for the main LegendHUB database.

### Services
There are additional routine maintenance and related services that run periodically outside of the web server.

These services are written in python and are found within the `python/` directory.

## Maintenance
> Each of the following sections includes detailed instructions for maintenance of the various areas in LegendHUB.

### Backups
LegendHUB automatically creates daily backups of the SQL database and drops them in `database-backups` Docker volume. This backup file is overwritten every day. It is recommended that you take these backups and copy them to a remote location.

There is a public and private directory in this volume. The public directory contains a backup without sensitive data, such as accounts, notifications, settings, etc.. The private directory contains a full backup of everything.

### Updating the Builder
The builder is perhaps the messiest bit of code on the website.
It has long been on my todo list for refactoring and cleaning up.

The reason it hasn't happened is because of how massive and fragile I view it.

Player lists are stored in localStorage on the browser. If a user clears their storage, uses a new browser, or runs into an error while using the builder, their lists are gone.
Users are '''highly''' encouraged to export their lists periodically and back them up, but this advice is not always followed.

There is a system in place to catch unexpected exceptions that occur. If the user encounters one of these exceptions, the builder will no longer try to save their lists and will inform the user to refresh their browser. This should mitigate corrupt lists, though it may still be possible for other types of issues to corrupt lists, such as bad code in the saving or loading of lists. If the builder loads a list incorrectly, it will save it incorrectly as well, and lose any data that wasn't accounted for. If the code that saves lists is incorrect, it could also omit or mangle data.

#### Updating Stat Formulas
The function `getStatTotal` sums up stats and stat bonuses for each column in the builder.

There are a few sections inside of this area that handle unique scenarios, such as adding up base stats, item stats, applying item limits, apply bonus stats from other stats, apply total caps, etc.
These sections should be commented and easy to find.

Within the functions called from that function, are typically switch statements that handle each stat individually, so it should be easy to find where stat formulas/item limits/caps need to be updated.

### Updating Code
If any code needs to be updated, certain steps should be taken to ensure the code updates are put into effect.

In the case of any HTML or client-side JavaScript updates, the changes will be put into effect immediately.
In these cases, it may be a good idea to make these changes in a development environment first, to prevent any issues from happening on the production site.

While client-side JavaScript changes *can* go into effect immediately, they don't always do because of browser caching. In order to force a JavaScript change to be put into effect, change the version number in the `www/package.json` file and restart the NodeJS application or Docker container.

Any changes to the NodeJS server-side JavaScript will *not* be put into effect until the NodeJS application or Docker container are restarted.

### Updating CSS
LegendHUB uses [https://getbootstrap.com/docs/4.5/getting-started/introduction/ Bootstrap 4.x] to provide an easy-to-use UI framework.
There has been some minor customization of this framework to meet LegendHUBs needs.

If any additional changes need to be made for custom CSS, this can be done in the `css/scss/custom/_custom.scss` file.

After making any changes, simply running `npm run build` will trigger a compile of the scss, linting of the resulting css, auto-prefixing for browser support, minification, and copying of the final files to the css directory in the web project's public files.

There are also a couple of themes that I've provided that can be found in the `css/scss/custom/themes/` directory.
These theme files change SCSS variables to define different properties that are used for bootstrap components and utilities.

### Permissions
Certain actions on LegendHUB require permissions to complete.
The following tables dictate how Members can interact with the website:
* Roles
* Permissions
* MemberRoleMap
* RolePermissionMap

There are currently no CRUD pages that make it easy to modify Permissions and Roles.
This must be done through SQL.

Currently the following permissions exist:
* Item - Allows a user to CRUD an Item
* Mob - Allows a user to CRUD a Mob
* Quest - Allows a user to CRUD a Quest
* Wiki - Allows a user to CRUD a Wiki
* ChangelogVersion - Allows a user to CRUD a changelog version. AKA update announcement.
* Password - Allows a user to change any other user's password. This is obviously highly dangerous and should be reserved for admins.
These can be seen at any time via the Permissions table.

The Roles table defines which permissions a specific role has.
This table contains an entry for each role on the website.
Currently the following roles exist:
* Admin - Has access to everything (assuming you update the role when new permissions are added)
* Member - Basic member role that new accounts get by default.
* Developer - Role for website developers
* ResetPasswords - Has the ability to reset passwords
* Deleter - Has the ability to soft delete pages.

Roles can be assigned permissions by updating the RolePermissionMap table.
This table is a many-to-many relationship that also includes how each role interacts with each permission.
Each record contains the role and permission to be mapped, as well as whether that mapping allows for create, read, update, or delete privileges.

Members can be assigned roles by updating the MemberRoleMap table.
This table is a many-to-many relationship and contains two columns: MemberId and RoleId.

### Updating SQL Data
If you need to run any INSERT/UPDATE/DELETE queries in SQL, you must temporarily disable the triggers so that the update doesn't cause any notifications to be generated for users.
This only needs to be done if you're modifying one of the following tables:
* ChangelogVersions
* Items
* Mobs
* Quests
* WikiPages

If this step isn't done before updating hundreds of rows, users will end up with quite a few notifications.

This can be done by running `SET @DISABLE_NOTIFICATIONS = 1`.
This will only disable notifications for your SQL session, not for users on the website.

### Adding New Areas
There are currently no CRUD pages that make it easy to modify Areas.
This must be done through SQL.

The Areas table contains a list of areas in the game. This list is used to allow users to select areas for Items, Mobs, and Quests.
To add a new area, simply fill out the `Name` and `EraId` for the record. The `EraId` column can be determined via the `Eras` table. The `LuciferName` and `Era` columns are deprecated and should no longer be used, though I still tend to fill out the `Era` column as it's pretty easy to do so.

No additional efforts need to be taken aside from including the new area in the `Areas` table.
The website will automatically update as needed.

### Adding a New Stat
This is probably the most involved aspect of LegendHUB, but is also made to be as easy as possible. (Though I'm sure there is room for improvement in this area)

The first thing that should be done is adding the stat to the Items and Items_AuditTrail table.

The second thing that should be done is updating the `Items_AFTER_INSERT` and `Items_BEFORE_UPDATE` triggers.

The third thing that should be done is adding the stat to the ItemStatInfo.
The following columns are available in this table:
* Id - Identity column
* Display - How the stat should be displayed in the UI.
* Short - How the stat should be displayed in the UI when space is limited.
* Var - How the stat should be referred to in code, as well as the column name in the Items and Items_AuditTrail table.
    * This variable should start with a lowercase letter. Any generated SQL using this Var column will automatically capitalize the first letter of the variable to match the column in the Items table.
* Type - The type of the stat. See more info about this below.
* FilterString - How filtering is applied when enabled in the item search. See more info about this below.
* DefaultValue - The default value for populating the Add Item page.
* NetStat - The NetStat worth for this type.
* ShowColumnDefault - Whether the column should be enabled by default in the items search page. (only affects users who visit the site for the first time, selection then stored in cookies)
* Editable - Whether the column is editable. Some columns are not available on Add and Edit Item pages.
* CategoryId - ForeignKey to the ItemStatCategories table. Defines where in the Add/Edit Item pages it shows up, as well as where in the `show columns` modal on the item search and builder pages.
* SortNumber - This defines where this particular stat shows up in the full list of stats. Defines the `show columns` modals, the builder list view, and Add/Edit Item pages.

The final thing that should be done is restarting the docker instance. It does not need to be rebuilt.
This will ensure that the NodeJS backend gets a hold of the new stat and updates the API code for it.

#### Type
This column defines how input fields and sorting work for the stat.
The following types are valid values for this column:
* bool
* decimal
* int
* select (Used for dropdowns. See below)
* string

The select type requires a fourth step for the new stat to function.
In the `www/src/public/js/apps/legendwiki-app.js` file, there are two variables called `selectOptions` and `selectShortOptions`.
Each of these variables needs a new property whose name must be the same as the `Var` column in the `ItemStatInfo` table.

The property should map to an array of strings. The first item in that array is the `null` value display. For most cases, this is an empty string. The following strings are displayed when the value is equal to the index of the string.

The `selectOptions` decides what should be displayed when there is plenty of room in the UI.

The `selectShortOptions` decides what should be displayed when there is not much room in the UI.

#### FilterString
This defines how the SQL will be generated for searching items when this particular filter is enabled.

For example, the `Light` stat is a boolean value, so the `FilterString` is set to `= 1`.
This means that the generated SQL will append `isLight = 1` to the WHERE clause.

As another example, the `Hp Regen` stat is an integer value, so the `FilterString` is set to `> 0`.
This means that the generated SQL will append `hpr > 0` to the WHERE clause.

The final example is for select type stats. The `Weapon Type` stat is a dropdown value, so the `FilterString` is set to `= {0}`.
The `{0}` is automatically replaced with the chosen item in the dropdown from the filter modal. So any select type stats, should also have this same `FilterString`.

## TODO List
> There were a number of things I still wanted to do with LegendHUB to clean it up, improve it.
These aren't necessarily major features, but things that should be noted.

* Update builder to use better AngularJS standards as seen at the bottom of the `www/src/views/items/modify.ejs` file
    * This style is taken from [johnpapa's AngularJS Style Guide](https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md) which has the added benefit of ensuring minification works without issues.
* Move AngularJS code to separate files
    *Dependent on webpack to avoid longer loading times
* Add webpack or similar tool to combine and minify related JavaScript files for each page to ensure faster loading and cleaner code organization
    *Would also allow the `www/src/js/apps/legendwiki-app.js` file to be split up into a more logical file structure
    *Minification is problematic with certain snippets of current AngularJS code, as it is not adhering to best standards, yet
* Update builder to store lists in the database instead of in localStorage
    *Might require merging/overwriting support to allow people to upload their lists from separate computers which may contain conflicts
* Use LegendMUD logins instead of a separate LegendHUB login to provide better security and account help.
* Use websockets to provide more immediate feedback for new notifications. (would require changes to python service most likely.)
* Move AngularJS to a more recent Javascript framework, preferrably one that is component-driven.

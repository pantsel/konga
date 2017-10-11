# Change Log

All notable changes to this project will be documented in this file.

## [0.6.1](https://github.com/pantsel/konga/releases/tag/v0.6.1) - 18-3-2017

* Added Change Log.
* Implemented better first-launch setup logic.
* "Kong nodes" are now referenced as "Connections".
* Fixed minor issues.

## [0.6.0](https://github.com/pantsel/konga/releases/tag/v0.6.0) - 18-3-2017

* Kong version is now defined in the scope of a connection to the admin API.
* Added support for upstreams, targets and the new SSL implementation logic.
* Added integration with some of the most popular databases out of the box (MySQL,PostgresSQL,SQL Server,MongoDB).
* Added new consumer import adapter (API).
* Fixed various minor bugs.

## [0.6.3](https://github.com/pantsel/konga/releases/tag/v0.6.3) - 2-4-2017

* New feature : Connection Chooser
* New feature : Snapshots (beta)
* Started TAG based docker automated builds
* Various fixes and improvements

## [0.6.4](https://github.com/pantsel/konga/releases/tag/v0.6.4) - 8-4-2017

* Changed user - node relation logic (see note).
* Active node version is taken directly from the Gateway info endpoint instead of the user created node.
* Fixed Bottom panel connection chooser (issue #41).
* Removed delete and update functionality from Upstreams.
* Various fixes and improvements

## [0.6.5](https://github.com/pantsel/konga/releases/tag/v0.6.5) - 13-4-2017

* Fixed: Adding apis consecutively pre-populates fields with previous entry (issue #43)
* Fixed: dashboard not updating when changing node (issue #41).
* Various fixes and improvements

## [0.6.6](https://github.com/pantsel/konga/releases/tag/v0.6.6) - 25-4-2017

* Fixed issue:  Can't edit consumer/api with custom user #49
* Fixed bower dependencies
* Various fixes and improvements



## [0.6.5](https://github.com/pantsel/konga/releases/tag/v0.6.5) - 13-4-2017

* Fixed: Adding apis consecutively pre-populates fields with previous entry (issue #43)
* Fixed: dashboard not updating when changing node (issue #41).
* Various fixes and improvements


## [0.6.6](https://github.com/pantsel/konga/releases/tag/v0.6.6) - 25-4-2017

* Fixed issue:  Can't edit consumer/api with custom user #49
* Fixed bower dependencies
* Various fixes and improvements


## [0.6.7](https://github.com/pantsel/konga/releases/tag/v0.6.7) - 6-5-2017

* Various fixes and improvements


## [0.6.8](https://github.com/pantsel/konga/releases/tag/v0.6.8) - 7-5-2017

* Proper Certificates implementation


## [0.6.9](https://github.com/pantsel/konga/releases/tag/v0.6.9) - 13-5-2017

* Consumers can also be backed up with the Snapshots feature.
* Request Transformer Plugins can now be restored through Snapshots Feature (issue #62). 
* Implemented data polling in the dashboard page (issue #61).
* Demo user can now define default connection although permissions are not fully implemented yet. It's best that you only use admin users for now (issue #60).
* Better error handling on profile updates (issue #59).
* Various minor fixes and improvements



## [0.7.0](https://github.com/pantsel/konga/releases/tag/v0.7.0) - 14-5-2017

* Node and API health checks.
* Email notifications when health checks for Nodes or APIs fail.
* Import/Export Snapshots.
* Relative paths support for assets and sails.io.
* Local db path is now configurable and persistent in docker image with it's own volume.


## [0.7.1](https://github.com/pantsel/konga/releases/tag/v0.7.1) - 16-5-2017

* Fixed bug that updated localStorage user when performing a user update even if the acting user wasn't the same.
* Added the --harmony parameter on start.sh fixing Node version compatibility issues with some modules (nodemailer)


## [0.7.2](https://github.com/pantsel/konga/releases/tag/v0.7.2) - 17-5-2017

* UI/UX improvements.
* User sign up.
* More configurable application settings.


## [0.8.0](https://github.com/pantsel/konga/releases/tag/v0.8.0) - 23-5-2017

* UI/UX revamp.
* Massive refactoring and logic improvements.
* Configurable user permissions.
* Various bug fixes and improvements.

## [0.8.1](https://github.com/pantsel/konga/releases/tag/v0.8.1) - 3-7-2017

## [0.8.3](https://github.com/pantsel/konga/releases/tag/v0.8.2) - 20-8-2017

* Kong 0.11.x compatibility.
* Added the ability to manage consumer plugins directly from the consumer edit page.
* More dynamic backwards compatibility logic.
* Other minor fixes and improvements.

## [0.8.4](https://github.com/pantsel/konga/releases/tag/v0.8.4) - 19-9-2017

* Fix bug where a new user could not be created when users where not allowed to sign up.
* Hide API keys in connections when logged in as a simple user.

## [0.8.5](https://github.com/pantsel/konga/releases/tag/v0.8.5) - 23-9-2017

* Fix docker automated builds failure.
* Removed kong admin url from connections chooser.
* Sails js hookTimeout is now configurable via env var <code>KONGA_HOOK_TIMEOUT</code>. 

## [0.8.6](https://github.com/pantsel/konga/releases/tag/v0.8.6) - 24-9-2017

## [0.8.7](https://github.com/pantsel/konga/releases/tag/0.8.7) - 29-9-2017

* [FIX] Tests are working again.
* [FIX] Better error handling when adding groups and credentials to consumers.
* [FIX] <code>kongadata</code> dir is now created inside the project folder by default. The docker volume now becomes <code>/app/kongadata</code>

## [0.8.8](https://github.com/pantsel/konga/releases/tag/0.8.8) - 8-10-2017

* When starting the app for the first time using postgres or MySQL adapters, Konga will now create the databases automatically.
* Parts of UI are redesigned in a cleaner way.
* Consumer page now also displays the APIs a consumer can access based on his ACLs.
* Slack integration. You can now configure Konga to send notifications to slack.
* Fix issue which prevented consumer creation with empty `username` or `custom_id`.
* Other minor bug fixes and improvements.

## [0.8.9](https://github.com/pantsel/konga/releases/tag/0.8.9) - 8-11-2017
* Allow certificates deletion.
* Manage SNIs from certificates detail modal.
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

## [0.7.0](https://github.com/pantsel/konga/releases/tag/v0.7.0) - 25-4-2017
* Kong nodes & API health checks
* Email notifications
* Export consumers in .json file
* New consumers import adapter : Konga JSON
* Various fixes and improvements

### Note: This version introduces changes in Konga's database. See issue #40 on how they can be implemented.

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


## [0.7.0](https://github.com/pantsel/konga/releases/tag/v0.6.9) - 14-5-2017

* Node and API health checks.
* Email notifications when health checks for Nodes or APIs fail.
* Relative paths support for assets and sails.io.


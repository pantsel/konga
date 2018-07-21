## More than just another GUI to [KONG Admin API](http://getkong.org)    [![Build Status](https://travis-ci.org/pantsel/konga.svg?branch=master)](https://travis-ci.org/pantsel/konga)    [![Gitter chat](https://badges.gitter.im/pantsel-konga/Lobby.png)](https://gitter.im/pantsel-konga/Lobby)


[![Dashboard](screenshots/bc3.png)](https://raw.githubusercontent.com/pantsel/konga/master/screenshots/bc2.png)

_Konga is not an official app. No affiliation with [Kong](https://www.konghq.com/)._


[Site and working demo here](https://pantsel.github.io/konga/)

> Notice: Upgrade your Kong installations to v0.12.x so you can use Konga to it's full capacity.
  Starting with Konga 0.11.x, Kong versions prior to 0.12.x are not supported.

## Summary

- [**Discussions & Support**](#discussions--support)
- [**Features**](#features)
- [**Compatibility**](#compatibility)
- [**Prerequisites**](#prerequisites)
- [**Used libraries**](#used-libraries)
- [**Installation**](#installation)
- [**Configuration**](#configuration)
- [**Running Konga**](#running-konga)
- [**Upgrading**](#upgrading)
- [**FAQ**](#faq)
- [**More Kong related stuff**](#more-kong-related-stuff)
- [**License**](#license)

## Discussions & Support
If you need to discuss anything Konga related, we have a chatroom on Gitter:

[![Gitter chat](https://badges.gitter.im/pantsel-konga/Lobby.png)](https://gitter.im/pantsel-konga/Lobby)

## Features
* Manage all Kong Admin API Objects.
* Import Consumers from remote sources (Databases, files, APIs etc.).
* Manage multiple Kong Nodes.
* Backup, restore and migrate Kong Nodes using Snapshots.
* Monitor Node and API states using health checks.
* Email notifications.
* Multiple users.
* Easy database integration (MySQL, postgresSQL, MongoDB, SQL Server).

## Compatibility
1. **Konga up to 0.10.*** is fully compatible with **Kong 0.11.x,0.12.x**. 
It may work with older versions as well but they are not actively supported.
It also works with Kong 0.13.* yet without the ability to manage services and routes.

2. **Konga 0.12+** is fully compatible with **Kong 0.14+**. Compatibility for older Kong versions
 is still present but not guaranteed.

## Prerequisites
- A running [Kong installation](https://getkong.org/) 
- Nodejs
- Npm

## Used libraries
* Sails.js, http://sailsjs.org/
* AngularJS, https://angularjs.org/
* Bootstrap, http://getbootstrap.com/

## Installation

Install `npm` and `node.js`. Instructions can be found [here](http://sailsjs.org/#/getStarted?q=what-os-do-i-need).

Install `bower`, `gulp` and `sails` packages.
```
$ git clone https://github.com/pantsel/konga.git
$ cd konga
$ npm install
```

## Configuration
You can configure your  application to use your environment specified
settings.

There is an example configuration file on following path.

```
config/local_example.js
```

Just copy this to `config/local.js` and make necessary changes to it. Note that this
`local.js` file is in .gitignore so it won't go to VCS at any point.

### Databases Integration

Konga is bundled with It's own persistence mechanism for storing users and configuration.

A local persistent object store is used by default, which works great as a bundled, starter database (with the strict caveat that it is for non-production use only).

The application also supports some of the most popular databases out of the box:

1. MySQL
2. MongoDB
3. PostgresSQL
4. SQL Server

In order to use them, in your `/config/local.js` replace
```
models: {
    connection: process.env.DB_ADAPTER || 'localDiskDb',
}
```
with
```
models: {
    connection: process.env.DB_ADAPTER || 'the-name-of-adapter-you-wish-to-use', // 'mysql', 'mongo', 'sqlserver' or 'postgres'
}
```

See [Sails adapters](http://sailsjs.com/documentation/concepts/extending-sails/adapters/available-adapters) for further configuration

***************************************************************************************** 
##### Note : 
In case of `MySQL`, `PostgresSQL` or `SQL Server` adapters, 
you will need to prepare the database as explained on the next topic. 

***************************************************************************************** 

## Running Konga

### Development
```
$ npm start
```
Konga GUI will be available at `http://localhost:1337`

### Production

```
$ npm run production
```
Konga GUI will be available at `http://localhost:1337`

### Production Docker Image

The following instructions assume that you have a running Kong instance following the
instructions from [Kong's docker hub](https://hub.docker.com/_/kong/)
```
$ docker pull pantsel/konga
$ docker run -p 1337:1337 \
             --network {{kong-network}} \ // optional
             --name konga \
             -e "NODE_ENV=production" \ // or "development" | defaults to 'development'
             pantsel/konga
```

#### To use one of the supported databases

1. ##### Prepare the database
> **Note**: You can skip this step if using the `mongo` adapter.

Konga will not perform db migrations when running in production mode.

You can manually perform the migrations by calling ```$ node ./bin/konga.js  prepare``` 
, passing the args needed for the database connectivity.

The available adapters are ```'postgres', or 'mysql'``` 

```
$ node ./bin/konga.js  prepare --adapter {adapter_name} --uri {full_connection_string}
```
The process will exit after all migrations are completed.

If you're deploying Konga via the docker image, you can prepare the database using 
an ephemeral container running the prepare command.

**Args**

argument  | description | default
----------|-------------|--------
-c      | command | -
-a      | adapter (can be `postgres` or `mysql`) | -
-u     | full database connection url | -
-p     | port | `1339`

```
$ docker run --rm pantsel/konga:next -c prepare -a {{adapter}} -u {{connection-uri}} -p {{port}}
```


2. ##### Start Konga
```
$ docker run -p 1337:1337 
             --network {{kong-network}} \ // optional
             -e "DB_ADAPTER=the-name-of-the-adapter" \ // 'mongo','postgres','sqlserver'  or 'mysql'
             -e "DB_HOST=your-db-hostname" \
             -e "DB_PORT=your-db-port" \ // Defaults to the default db port
             -e "DB_USER=your-db-user" \ // Omit if not relevant
             -e "DB_PASSWORD=your-db-password" \ // Omit if not relevant
             -e "DB_DATABASE=your-db-name" \ // Defaults to 'konga_database'
             -e "DB_PG_SCHEMA=my-schema"\ // Optionally define a schema when integrating with prostgres
             -e "NODE_ENV=production" \ // or 'development' | defaults to 'development'
             --name konga \
             pantsel/konga
             
             
 // Alternatively you can use the full connection string to connect to a database
 $ docker run -p 1337:1337 
              --network {{kong-network}} \ // optional
              -e "DB_ADAPTER=the-name-of-the-adapter" \ // 'mongo','postgres','sqlserver'  or 'mysql'
              -e "DB_URI=full-conection-uri" \
              -e "NODE_ENV=production" \ // or 'development' | defaults to 'development'
              --name konga \
              pantsel/konga
```


The GUI will be available at `http://{your server's public ip}:1337`


#### Login
*Admin*
login: admin | password: adminadminadmin

*Demo user*
login: demo | password: demodemodemo

This user data is populated to the database if there is not already any user data in it. [It is possible to alter the default user seed data.](DEFAULTUSERSEEDDATA.md)

## Upgrading
In some cases a newer version of Konga may introduce new db tables, collections or changes in schemas.
The only thing you need to do is to start Konga in dev mode once so that the migrations will be applied.
Then stop the app and run it again in production mode.

## FAQ

##### 1. Getting blank page with `Uncaught ReferenceError: angular is not defined`

In some cases when running `npm install`, the bower dependencies are not installed properly.
You will need to cd into your project's root directory and install them manually by typing
```
$ npm run bower-deps
```

##### 2. Can't add/edit some plugin properties.
When a plugin property is an array, the input is handled by a chip component.
You will need to press `enter` after every value you type in
so that the component assigns it to an array index.
See issue [#48](https://github.com/pantsel/konga/issues/48) for reference.

##### 3. EACCES permission denied, mkdir '/kongadata/'.
If you see this error while trying to run Konga, it means that konga has no write permissions to
it's default data dir `/kongadata`.  You will just have to define the storage path yourself to 
a directory Konga will have access permissions via the env var `STORAGE_PATH`.

##### 4. The hook `grunt` is taking too long to load
The default timeout for the sails hooks to load is 60000. In some cases, depending on
the memory the host machine has available, startup tasks like code minification and uglyfication
may take longer to complete. You can fix that by setting then env var `KONGA_HOOK_TIMEOUT` to something
greater than 60000, like 120000.


## More Kong related stuff
- [**Kong Admin proxy**](https://github.com/pantsel/kong-admin-proxy)
- [**Kong Middleman plugin**](https://github.com/pantsel/kong-middleman-plugin)


## Author
Panagis Tselentis

## License
```
The MIT License (MIT)
=====================

Copyright (c) 2015 Panagis Tselentis

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

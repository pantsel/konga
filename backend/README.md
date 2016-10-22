# Backend for angular-sailsjs-boilerplate
[![Build Status](https://travis-ci.org/tarlepp/angular-sailsjs-boilerplate-backend.png?branch=master)](https://travis-ci.org/tarlepp/angular-sailsjs-boilerplate-backend)
[![Dependency Status](https://david-dm.org/tarlepp/angular-sailsjs-boilerplate-backend.svg)](https://david-dm.org/tarlepp/angular-sailsjs-boilerplate-backend)
[![devDependency Status](https://david-dm.org/tarlepp/angular-sailsjs-boilerplate-backend/dev-status.svg)](https://david-dm.org/tarlepp/angular-sailsjs-boilerplate-backend#info=devDependencies)

Backend is a [Sails.js](http://sailsjs.org) application without frontend. See more info at http://sailsjs.org/ I have 
just done some small tweaks to generic workflow of sails nothing else. Basically this only serves an API and
user authentication services - nothing else. So the main difference withing sails normal workflow is that sails isn't 
serving any "views", backend serves only JSON and nothing else.

This backend code is part of [angular-sailsjs-boilerplate](https://github.com/tarlepp/angular-sailsjs-boilerplate) project.

## Installation
First of all you have to install npm, node.js / io.js and sails to your box. Installation instructions can be 
found [here](http://sailsjs.org/get-started).

After that make sure that you have all necessary components installed by running following commands in your shell:

```
npm --version
node --version
sails --version
```

And after that you can run actual backend install by following command in source root folder:

```
npm install
```

## Configuration
Backend needs some configurations before you can actually run it properly. Although you can skip this section if you
want to, in this case sails will use its defaults to run application. 

There is an example of backend configuration file on following path:

```
/config/local_example.js
```

Just copy this file to ```/config/local.js``` and make necessary changes to it. Note that this ```local.js``` file is 
in ```.gitignore``` so it won't go to VCS at any point.

## Application start
You can start this backend application as the same way as any sails / node application. This can be done by following
commands:

```
sails lift
```
OR
```
node app.js
```

This will start sails.js server on defined port. By default this is accessible from http://localhost:1337 url. If you 
try that with your browser you should only see page that contains ```Not Found message``` on it. This means that 
everything is ok.

## Possible failures
Below is small list of possible failures that can occur while trying this.

<ol>
    <li>Sails won't lift and you get error message like: <code>Fatal error: watch ENOSPC</code>
        <ul>
            <li>http://stackoverflow.com/questions/16748737/grunt-watch-error-waiting-fatal-error-watch-enospc</li>
            <li>tl;dr just run <code>npm dedupe</code> 
        </ul>
    </li>
</ol>

<em>And if _you_ have some problems, please add solutions to this list...</em>

## Author
Tarmo Leppänen

## License
The MIT License (MIT)

Copyright (c) 2015 Tarmo Leppänen

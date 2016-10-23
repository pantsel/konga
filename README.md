## Just another GUI to [KONG API Gateway](http://getkong.org)

[![konga-logo.png](screenshots/konga-logo.png)](screenshots/konga-logo.png?raw=true)

[![Build Status](https://travis-ci.org/pantsel/konga.svg?branch=master)](https://travis-ci.org/pantsel/konga)

## Screenshots

##### Admin Home
<kbd>[![Admin Home](screenshots/thumbs/admin.jpg)](screenshots/admin.png?raw=true)</kbd>

##### APIs Managements
<kbd>[![APIs](screenshots/thumbs/apis.jpg)](screenshots/apis.png?raw=true)</kbd>   <kbd>[![APIs plugins](screenshots/thumbs/apis-plugins.jpg)](screenshots/apis-plugins.png?raw=true)</kbd>   <kbd>[![APIs plugins management](screenshots/thumbs/manage-api-plugins.jpg)](screenshots/manage-api-pugins.png?raw=true)</kbd>

##### Consumers Management
<kbd>[![Consumers](screenshots/thumbs/consumers.jpg)](screenshots/consumers.png?raw=true)</kbd>  <kbd>[![APIs plugins management](screenshots/thumbs/consumers-cfg-info.jpg)](screenshots/consumers-cfg-info.png?raw=true)</kbd>  <kbd>[![Consumers](screenshots/thumbs/consumers-cfg-groups.jpg)](screenshots/consumers-cfg-groups.png?raw=true)</kbd>  
<kbd>[![APIs plugins management](screenshots/thumbs/consumers-cfg-creds.jpg)](screenshots/consumers-cfg-creds.png?raw=true)</kbd>
## Features
* Manage APIs and plugins
* Manage consumers, groups and credentials
* Multiple nodes management
* GUI level authentication
* Multiple users (Only admin and user roles for now)

## Compatibility
Konga is built and tested on Kong 0.9.x but it probably works with older versions as well.
Feedback on older versions is welcome.

## Prerequisites
- A running [Kong installation](https://getkong.org/) 
- Nodejs
- Npm
- Gulp
- Bower

## Used libraries.
* angular-sailsjs-boilerplate (awesome): https://github.com/tarlepp/angular-sailsjs-boilerplate
* Sails.js, http://sailsjs.org/
* AngularJS, https://angularjs.org/
* Bootstrap, http://getbootstrap.com/

## Installation
Install <code>npm</code> and <code>node.js</code>. Instructions can be found [here](http://sailsjs.org/#/getStarted?q=what-os-do-i-need).

Install <code>bower</code>, <code>gulp</code> and <code>sails</code> packages.
<pre>
$ npm install bower gulp sails -g
</pre>

#### Backend and frontend installation

Clone this repository
<pre>
$ git clone https://github.com/pantsel/konga.git
</pre>

Install from the root directory

<pre>
$ cd path/to/cloned/konga/repo
$ npm install
</pre>

or navigate to /backend and /frontend directories and run <code>npm install</code> separately

<pre>
$ cd path/to/cloned/konga/repo/backend
$ npm install
</pre>
<pre>
$ cd path/to/cloned/konga/repo/backend
$ npm install
</pre>

### Configuration
You can configure your <code>backend</code> and <code>frontend</code> applications to use your environment specified
settings. Basically by default you don't need to make any configurations at all. With default configuration backend will be run on http://localhost:1337 and frontend on http://localhost:3001 (development) http://localhost:3000 (production).

##### Backend
There is an example of backend configuration file on following path.

<pre>
/backend/config/local_example.js
</pre>

Just copy this to <code>/backend/config/local.js</code> and make necessary changes to it. Note that this
<code>local.js</code> file is in .gitignore so it won't go to VCS at any point.

##### Frontend
There is an example of front configuration file on following path.

<pre>
/frontend/config/config_example.json
</pre>

Just copy this to <code>/frontend/config/config.json</code> and make necessary changes to it. Note that this
<code>config.json</code> file is in .gitignore so it won't go to VCS at any point.

##### Notes
If you're changing your backend API url to another than <code>http://localhost:1337</code> you need to make
<code>frontend/config/config.json</code> with proper content on it. Use that example file as start.

## Running Konga
You can start frontend and backend separately or concurrently
#### Starting backend and frontend concurrently
From the root directory of the cloned Konga repo run
<pre>
$ npm start
</pre>

This will start the sails.js server and a simple web server that you can use within developing frontend side.

#### Starting backend
<pre>
$ cd backend
$ sails lift
</pre>

This will start sails.js server on defined port. By default this is accessible from http://localhost:1337 url. If you
try that with your browser you should only see page that contains <code>Not Found</code> message on it. This means that
everything is ok.

#### Starting frontend

##### Development #####
<pre>
$ cd frontend
$ gulp serve
</pre>

This will start simple web server that you can use within developing frontend side. By default this is accessible from http://localhost:3001 url. You should be see login page if you try that url with your browser.

##### Deployment #####
As in production
<pre>
$ cd frontend
$ gulp dist
</pre>

This will create a deployment code to ```frontend/dist``` folder. After that you can serve those static HTML, CSS,
Javascript and asset files by any web server you like (Apache, nginx, IIS, etc.). For testing this production ready code
you can also use ```gulp production``` command which will serve those dist files. By default this is accessible from
http://localhost:3000 url.

### Possible failures
Below is small list of possible failures that can occur while trying this POC.

<ol>
    <li>Sails won't lift and you get error message like: <code>Fatal error: watch ENOSPC</code>
        <ul>
            <li>http://stackoverflow.com/questions/16748737/grunt-watch-error-waiting-fatal-error-watch-enospc</li>
            <li>tl;dr just run <code>npm dedupe</code>
        </ul>
    </li>
    <li>Frontend side is missing some 3rd party libraries. eg. browser console is full of some errors.
        <ul>
            <li>Try to install bower packages manually by command <code>bower install</code> in <code>frontend</code> directory.
        </ul>        
    </li>
    <li>When running gulp serve from the frontend directory an error of 'scss-lint' is not recognized.
        <ul>
            <li>Try running gem install scss-lint from the frontend directory.
        </ul>        
    </li>
</ol>

## Login to GUI

#### Admin
login: admin | password: adminadminadmin

#### Demo user
login: demo | password: demodemodemo

## ToDo
* Complete tests
* Include Logging & dynamic SSL plugins
* Write a detailed Wiki

## Author
Panagis Tselentis

## License
The MIT License (MIT)

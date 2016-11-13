## More than just another GUI to [KONG Admin API](http://getkong.org)    [![Build Status](https://travis-ci.org/pantsel/konga.svg?branch=master)](https://travis-ci.org/pantsel/konga)

[![konga-logo.png](screenshots/konga-logo.png)](screenshots/konga-logo.png?raw=true)


[![Dashboard](screenshots/bc.png)](screenshots/bc.png?raw=true)

<em>Konga is not an official app. No affiliation with [Mashape](https://www.mashape.com/).</em>

## Summary

- [**Features**](#features)
- [**Compatibility**](#compatibility)
- [**Prerequisites**](#prerequisites)
- [**Used libraries**](#used-libraries)
- [**Installation**](#installation)
- [**Configuration**](#configuration)
- [**Running Konga**](#running-konga)
- [**Konga API**](#konga-api)
- [**License**](#license)

## Features
* Manage APIs and plugins
* Manage consumers, groups and credentials
* Mass import consumers from :
    * CSV document
    * Google Spreadsheets
    * MySQL
    * MongoDB
    * more underway...
* Multiple nodes management
* GUI level authentication
* Multiple users (Only admin and user roles for now)
* Utilities API

## Compatibility
Konga is built and tested on Kong 0.9.x but it probably works with older versions as well.
Feedback on older versions compatibility is welcome.

## Prerequisites
- A running [Kong installation](https://getkong.org/) 
- Nodejs
- Npm
- Gulp
- Bower

## Used libraries
* angular-sailsjs-boilerplate (awesome): https://github.com/tarlepp/angular-sailsjs-boilerplate
* Sails.js, http://sailsjs.org/
* AngularJS, https://angularjs.org/
* Bootstrap, http://getbootstrap.com/

## Installation

Install <code>npm</code> and <code>node.js</code>. Instructions can be found [here](http://sailsjs.org/#/getStarted?q=what-os-do-i-need).

Install <code>bower</code>, <code>gulp</code> and <code>sails</code> packages.
<pre>
$ npm install bower gulp sails -g
$ git clone https://github.com/pantsel/konga.git
$ cd konga
$ npm install
</pre>
This will install all frontend and backend dependencies. If for some reason this fails, 
try running <code>$ npm install</code> in /backend and /frontend separately

## Configuration
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


#### Development
<pre>
$ npm start
</pre>
Konga GUI is available at http://localhost:3001

You can also start frontend and backend separately
<pre>
$ cd frontend
$ gulp serve
</pre>
<pre>
$ cd backend
$ sails lift
</pre>

#### Production
<pre>
$ cd frontend
$ gulp dist
</pre>
This will create production-ready static code to frontend/dist ready to be served by any web server

<pre>
$ npm run production
</pre>
Konga GUI is available at http://localhost:3000

You can also start frontend and backend separately
<pre>
$ cd frontend
$ gulp production
</pre>
<pre>
$ cd backend
$ sails lift --prod
</pre>

#### Login
*Admin*
login: admin | password: adminadminadmin

*Demo user*
login: demo | password: demodemodemo


## Konga API

Apart from the GUI, Konga also exposes an API providing helpful methods for 
integrating your services and applications with Kong

### Exposing the API

There are some steps you need to take before exposing Konga's API.
All steps can be easily done form the GUI.

#### Step 1

The first thing you need to do is create a Kong API to use as a Gateway to Konga.

**Example API configuration:**

<pre>
name : konga
config.request_path : /konga
config.strip_request_path : true
config.preserve_host : true // We need this set to true so that Konga can validate that the request is coming from Kong
config.upstream_url : http://konga-host-url
</pre>

#### Step 2

Add a ***Key Authentication*** plugin to the created API.

#### Step 3

Create a consumer and associate it with an API key credential. This api key will be used to authenticate the requests made to Konga's API.

#### Step 4

Finally , you need to configure the kong_proxy_hosts property in <code>/backend/local.js</code>.
These are the hosts from which Konga will accept API requests.
For a local Kong installation this property would be:
<pre>
kong_proxy_hosts : ['127.0.0.1:8000'],
</pre>
Konga will now accept API requests originated from <code>127.0.0.1:8000</code>

> In a production environment it would be safer if the server blocked incoming traffic to the port Konga is lifted as well.

### API Methods

All requests made to Konga's API require some custom headers.


<table>
    <tr>
        <th>Header</th>
        <th>Default</th>
        <th>Description</th>
    </tr>
    <tr>
        <td><code>api-key-name</code> (required)</td>
        <td>-</td>
        <td><small>The api-key associated with the consumer you created to consume Konga's API. The name of this header must match one of the <code>key_names</code> you specified when assigning the Key Authentication plugin to the API.</small></td>
    </tr>
    <tr>
        <td><code>konga-node-id</code> (optional)</td>
        <td><small>The first active node found will be used.</small></td>
        <td><small>Konga can manage multiple Kong nodes. Because of that you need to specify the id of the node you need to work with.</small></td>
    </tr>
</table>


#### Create Consumer <code>POST</code>

> $ curl -X POST http://kong:8000/{your-api-request-path}/api/consumers

This method allows you to create a consumer while associating it with groups and authorizations all at once.


##### Request Body

<table>
    <tr>
        <th>Parameter</th>
        <th>Description</th>
    </tr>
    <tr>
        <td><code>username</code> (semi-optional)</td>
        <td><small>The consumer's <code>username</code>.</small></td>
    </tr>
    <tr>
        <td><code>custom_id</code> (semi-optional)</td>
        <td><small>The consumer's <code>custom_id</code>.</small></td>
    </tr>
    <tr>
        <td><code>acls</code> (optional)</td>
        <td><small>An array of group names to assign to the consumer.</small></td>
    </tr>
    <tr>
            <td><code>authorizations</code> (optional)</td>
            <td><small>An array of Authorization credentials to assign to the consumer.</small></td>
        </tr>
</table>

##### Example Request body
<pre>
{
    "username"  : "testio",
    "custom_id" : "qwerty",
    "acls" : ["group1","group2","group3"],
    "authorizations" : [{
        "name" : "basic-auth",
        "config" : {
            "username" : "testio",
            "password" : "secret"
        }
    },{
        "name" : "hmac-auth",
        "config" : {
            "username" : "testio",
            "secret" : "secret"
        }
    },{
        "name" : "jwt" // Default configuration will be used
    },{
        "name" : "key-auth" // Default configuration will be used
    },{
        "name" : "oauth2",
        "config" : {
            "name" : "testio",
            "redirect_uri" : "http://testio.com/authorize"
        }	
    }]
}
</pre>


#### Register API <code>POST</code>

> $ curl -X POST http://kong:8000/{your-api-request-path}/api/apis

This method allows you to register an API to Kong while adding required plugins to it as well.

> You can also update an already registered API and it's associated plugins by including the API's <code>id</code> and <code>created_at</code> properties to the request.

##### Example Request body

<pre>
{
	"name" : "testapi",
	"request_path" : "/testapi",
	"strip_request_path" : true,
	"preserve_host" : false,
	"upstream_url" : "http://testapi.io",
	"plugins" : [{
		"name" : "hmac-auth",
		"config.hide_credentials" :false
	},{
		"name" : "acl",
		"config.blacklist" : "192.168.1.2,192.168.1.3"
		
	},{
		"name" : "jwt" // Default configuration will be used
	}]
	
}
</pre>



## ToDo
* Complete tests
* Add more consumer import adapters (?)
* Write a detailed Wiki

## Author
Panagis Tselentis

## License
<pre>
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
</pre>

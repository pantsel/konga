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

#### Exposing the API

In <code>/backend/local.js</code> set the attribute <code>expose_api</code> to <code>true</code>

When the backend is lifted again, Konga will register it's API to Kong, create a consumer and associate that consumer to an apikey.

Additionally , you need to configure the <code>whitelist_hosts</code> attribute in <code>/backend/local.js</code>.
These are the hosts from which Konga will accept API requests.

By default, Konga will only accept API requests from <code>127.0.0.1</code>
<pre>
whitelist_hosts : ["127.0.0.1"]
</pre>


### API Methods

All requests made to Konga's API require some custom headers.


<table>
    <tr>
        <th>Header</th>
        <th>Default</th>
        <th>Description</th>
    </tr>
    <tr>
        <td><code>apiKey</code> (required)</td>
        <td>-</td>
        <td><small>The api-key of "konga" consumer.</small></td>
    </tr>
    <tr>
        <td><code>kong-admin-url</code> (optional)</td>
        <td><small>The <code>kong_admin_url</code> specified in <code>/backend</code> configuration.</small></td>
        <td><small>The URL of Kong's admin API.</small></td>
    </tr>
</table>


#### Create Consumer <code>POST</code>

> $ curl -X POST http://kong:8000/konga/consumers

This method allows you to create a consumer while associating it with groups and authorizations all at once.


##### Request Body

<table>
    <tr>
        <th>Attribute</th>
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

> $ curl -X POST http://kong:8000/konga/apis

This method allows you to register an API to Kong while adding required plugins to it as well.

> You can also update an already registered API and it's associated plugins by including the API's <code>id</code> and <code>created_at</code> properties to the request.


#####Request Body

<table><thead>
<tr>
<th style="text-align: right">Attribute</th>
<th>Description</th>
</tr>
</thead><tbody>
<tr>
<td style="text-align: right"><code>name</code><br><em>optional</em></td>
<td>The API name. If none is specified, will default to the <code>request_host</code> or <code>request_path</code>.</td>
</tr>
<tr>
<td style="text-align: right"><code>request_host</code><br><em>semi-optional</em></td>
<td>The public DNS address that points to your API. For example, <code>mockbin.com</code>. At least <code>request_host</code> or <code>request_path</code> or both should be specified.</td>
</tr>
<tr>
<td style="text-align: right"><code>request_path</code><br><em>semi-optional</em></td>
<td>The public path that points to your API. For example, <code>/someservice</code>. At least <code>request_host</code> or <code>request_path</code> or both should be specified.</td>
</tr>
<tr>
<td style="text-align: right"><code>strip_request_path</code><br><em>optional</em></td>
<td>Strip the <code>request_path</code> value before proxying the request to the final API. For example a request made to <code>/someservice/hello</code> will be resolved to <code>upstream_url/hello</code>. By default is <code>false</code>.</td>
</tr>
<tr>
<td style="text-align: right"><code>preserve_host</code><br><em>optional</em></td>
<td>Preserves the original <code>Host</code> header sent by the client, instead of replacing it with the hostname of the <code>upstream_url</code>. By default is <code>false</code>.</td>
</tr>
<tr>
<td style="text-align: right"><code>upstream_url</code></td>
<td>The base target URL that points to your API server, this URL will be used for proxying requests. For example, <code>https://mockbin.com</code>.</td>
</tr>
<td style="text-align: right"><code>plugins</code></td>
<td>An array of plugin configurations to add to the API.</td>
</tr>
</tbody></table>

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
* Move API to it's own module so that it is lifted on a different port (?)

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

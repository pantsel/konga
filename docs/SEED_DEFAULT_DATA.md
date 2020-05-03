# Changing the default user seed data

If you wish to seed users on first run, you can supply a file with user data. 
A sample file could look like:

````
module.exports = [
        {
            "username": "myadmin",
            "email": "myadmin@some.domain",
            "firstName": "Peter",
            "lastName": "Administrator",
            "node_id": "http://kong:8001",
            "admin": true,
            "active" : true,
            "password": "somepassword"
        },
        {
            "username": "otheruser",
            "email": "otheruser@some.domain",
            "firstName": "Joe",
            "lastName": "Blogs",
            "node_id": "http://kong:8001",
            "admin": false,
            "active" : true,
            "password": "anotherpassword"
        }
    ]
````

To make Konga use this file, you should set the environment variable KONGA_SEED_USER_DATA_SOURCE_FILE to point to the files location:
````
export KONGA_SEED_USER_DATA_SOURCE_FILE=~/userdb.data 
````

This is especially useful when running Konga in a container as part of a Docker swarm. The file can be setup as a Docker secret and supplied to the container. This can be done with an entry in a compose file similar to:

````
version: "3.1"

secrets:
  konga_user_seed:
    external: true

services:
  konga:
    image: pantsel/konga
    secrets:
     - konga_user_seed
    environment:
      - KONGA_SEED_USER_DATA_SOURCE_FILE=/run/secrets/konga_user_seed
    deploy:
      restart_policy:
        condition: on-failure
    ports:
     - 1337:1337
````

(This will work if the swarm is setup with the konga_user_seed secret set with it's value as the contents of the user file.)

# Adding a default kong node seed

If you wish to seed one or multiple kong connections on the first run, you can also add a kong node seed file, similar to the user one.

For example :

```
module.exports = [
    {
        "name": "Kong Test Seed",
        "type": "key_auth",
        "kong_admin_url": "http://kong:8001",
        "kong_api_key": "DonKeyKong",
        "health_checks": false,
    }
]
```

To make Konga use this file, you should set the environment variable KONGA_SEED_KONG_NODE_DATA_SOURCE_FILE to point to the files location:
````
export KONGA_SEED_KONG_NODE_DATA_SOURCE_FILE=~/kong_node.data 
````

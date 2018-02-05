/**
 * Created by rmetcalf9 on 5/2/2018.
 */
'use strict';

module.exports = {
    seedData: [
        {
            "username": "admin",
            "email": "admin@some.domain",
            "firstName": "Arnold",
            "lastName": "Administrator",
            "node_id": "http://kong:8001",
            "admin": true,
            "active" : true,
            "password": "adminadminadmin"
        },
        {
            "username": "demo",
            "email": "demo@some.domain",
            "firstName": "John",
            "lastName": "Doe",
            "node_id": "http://kong:8001",
            "admin": false,
            "active" : true,
            "password": "demodemodemo"
        }
    ]
}


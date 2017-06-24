/**
 * Created by user on 23/06/2017.
 */
'use strict'

module.exports = {
    authentication : function (req,res) {

        var schemas = [
            {
                name : "basic-auth",
                fields : [
                    {
                        name : "username",
                        description : "The username to use in the Basic Authentication",
                        required : true,
                        type : "string"
                    },
                    {
                        name : "password",
                        description : "The password to use in the Basic Authentication",
                        required : false,
                        type : "string"
                    }
                ]

            },
            {
                name : "key-auth",
                fields : [
                    {
                        name : "key",
                        description : "You can optionally set your own unique key to authenticate the client. If missing, the plugin will generate one.",
                        type : "string"
                    }
                ]

            },
            {
                name : "oauth2",
                fields : [
                    {
                        name : "name",
                        description : "The name to associate to the credential. In OAuth 2.0 this would be the application name.",
                        required : true,
                        type : "string"
                    },
                    {
                        name : "client_id",
                        description : "You can optionally set your own unique client_id. If missing, the plugin will generate one.",
                        type : "string"
                    },
                    {
                        name : "client_secret",
                        description : "You can optionally set your own unique client_secret. If missing, the plugin will generate one.",
                        type : "string"
                    },
                    {
                        name : "redirect_uri",
                        required : true,
                        description : "The URL in your app where users will be sent after authorization.",
                        type : "url"
                    }

                ]
            },
            {
                name : "hmac-auth",
                fields : [
                    {
                        name : "username",
                        description : "The username to use in the HMAC Signature verification.",
                        type : "string",
                        required : true
                    },
                    {
                        name : "secret",
                        description : "The secret to use in the HMAC Signature verification. Note that if this parameter isn't provided, Kong will generate a value for you and send it as part of the response body.",
                        type : "string"
                    }
                ]
            },
            {
                name : "jwt",
                fields : [
                    {
                        name : "key",
                        description : "A unique string identifying the credential. If left out, it will be auto-generated.",
                        type : "string"
                    },
                    {
                        name : "algorithm",
                        description : "The algorithm used to verify the token's signature. Can be HS256, RS256, or ES256.",
                        type : "string",
                        enum : ["HS256","RS256","ES256"],
                        default : "HS256"
                    },
                    {
                        name : "rsa_public_key",
                        description : "If algorithm is RS256 or ES256, the public key (in PEM format) to use to verify the token's signature.",
                        type : "textarea"

                    },
                    {
                        name : "secret",
                        description : "If algorithm is HS256 or ES256, the secret used to sign JWTs for this credential. If left out, will be auto-generated.",
                        type : "string"

                    }
                ]
            }
        ]

        return res.json({
            schemas : schemas
        })


    }
}

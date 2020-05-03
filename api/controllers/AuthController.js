'use strict';

var async = require('async');
var _ = require('lodash');
var uuidv4 = require('uuid/v4');
var UserSignUp = require("../events/user-events")

/**
 * Authentication Controller
 */
var AuthController = {

  register: async (req, res) => {

    let data = req.allParams();

    // If an admin is already registred, prevent further action
    const count = await sails.models.user.count({ admin: true });
    if (count > 0) {
      return res.view('welcomepage', {
        angularDebugEnabled: process.env.NODE_ENV == 'production' ? false : true,
        konga_version: require('../../package.json').version,
        invalidAttributes: {
          username: [{
            rule: 'required',
            message: 'An adming user is already registered!'
          }]
        },
        old_data: data
      })
    }

    function validateEmail(email) {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
    }

    // Validations
    let invalidAttributes = {};
    if(!data.username) {
      invalidAttributes.username = [{
        rule: 'required',
        message: 'A username is required'
      }]
    }

    if(!validateEmail(data.email)) {
      invalidAttributes.email = [{
        rule: 'email',
        message: 'The email you provided is not a valid email address'
      }]
    }


    if(!data.password) {
      invalidAttributes.password = [{
        rule: 'required',
        message: 'The password field is required'
      }]
    }

    if( data.password.length < 7) {
      invalidAttributes.password = [{
        rule: 'password',
        message: 'The password must be at least 7 characters long'
      }]
    }

    if(!data.password_confirmation) {
      invalidAttributes.password_confirmation = [{
        rule: 'required',
        message: 'The password confirmation field is required'
      }]
    }

    if(data.password !== data.password_confirmation) {
      if(!invalidAttributes.password) invalidAttributes.password = [];
      invalidAttributes.password.push({
        rule: 'password',
        message: 'The password and password confirmation do not match'
      })
    }

    if(Object.keys(invalidAttributes).length) {
      return res.view('welcomepage', {
        angularDebugEnabled: process.env.NODE_ENV == 'production' ? false : true,
        konga_version: require('../../package.json').version,
        invalidAttributes: invalidAttributes,
        old_data: data
      })
    }


    data.activationToken = uuidv4();
    data.admin = true;
    data.active = true;

    sails.models.user
      .create(_.omit(data, ['password', 'password_confirmation']))
      .exec(function (err, user) {
        if (err) {
          console.log(err.invalidAttributes)
          return res.view('welcomepage', {
            angularDebugEnabled: process.env.NODE_ENV == 'production' ? false : true,
            konga_version: require('../../package.json').version,
            invalidAttributes: err.invalidAttributes,
            old_data: data
          })
        }

        sails.models.passport
          .create({
            protocol: 'local',
            password: data.password,
            user: user.id
          }).exec(function (err, passport) {
          if (err) return res.negotiate(err)

          return res.redirect(process.env.BASE_URL || '')
        })
      })

  },


  signup: function (req, res) {

    var data = req.allParams()
    var passports = data.passports
    delete data.passports;
    delete data.password_confirmation


    // Assign activation token
    data.activationToken = uuidv4();

    // Check settings as to what to do after signup
    sails.models.settings
      .find()
      .limit(1)
      .exec(function (err, settings) {
        if (err) return res.negotiate(err)
        var _settings = settings[0].data;

        if (!_settings.signup_require_activation) {
          data.active = true; // Activate user automatically
        }


        sails.models.user
          .create(data)
          .exec(function (err, user) {
            if (err) return res.negotiate(err)

            sails.models.passport
              .create({
                protocol: passports.protocol,
                password: passports.password,
                user: user.id
              }).exec(function (err, passport) {
              if (err) return res.negotiate(err)

              // Emit signUp event
              UserSignUp.emit('user.signUp', {
                user: user,
                req: req,
                sendActivationEmail: _settings.signup_require_activation
              });

              return res.json(user)
            })
          })

      })


  },


  activate: function (req, res) {


    var token = req.param('token')
    if (!token) {
      return res.badRequest('Token is required.')
    }

    sails.models.user.findOne({
      activationToken: token,
      active: false
    }).exec(function (err, user) {
      if (err) return res.negotiate(err)
      if (!user) return res.notFound('Invalid token')

      sails.models.user.update({
        id: user.id
      }, {active: true})
        .exec(function (err, updated) {
          if (err) return res.negotiate(err)
          return res.redirect('/#!/login?activated=' + req.param('token'))
        })
    })

  },

  /**
   * Log out a user and return them to the homepage
   *
   * Passport exposes a logout() function on request (also aliased as logOut()) that can be
   * called from any route handler which needs to terminate a login session. Invoking logout()
   * will remove the request.user property and clear the login session (if any).
   *
   * For more information on logging out users in Passport.js, check out:
   * http://passportjs.org/guide/logout/
   *
   * @param   {Request}   request     Request object
   * @param   {Response}  response    Response object
   */
  logout: function logout(request, response) {
    request.logout();

    response.json(200, true);
  },

  /**
   * Create a third-party authentication endpoint
   *
   * @param   {Request}   request     Request object
   * @param   {Response}  response    Response object
   */
  provider: function provider(request, response) {
    sails.services.passport.endpoint(request, response);
  },

  /**
   * Simple action to check current auth status of user. Note that this will always send
   * HTTP status 200 and actual data will contain either user object or boolean false in
   * cases that user is not authenticated.
   *
   * @todo    Hmmm, I think that this will return always false, because of missing of
   *          actual sessions here...
   *
   * @param   {Request}   request     Request object
   * @param   {Response}  response    Response object
   */
  authenticated: function authenticated(request, response) {
    if (request.isAuthenticated()) {
      response.json(200, request.user);
    } else {
      response.json(200, false);
    }
  },

  /**
   * Create a authentication callback endpoint
   *
   * This endpoint handles everything related to creating and verifying Passports
   * and users, both locally and from third-party providers.
   *
   * Passport exposes a login() function on request (also aliased as logIn()) that
   * can be used to establish a login session. When the login operation completes,
   * user will be assigned to request.user.
   *
   * For more information on logging in users in Passport.js, check out:
   * http://passportjs.org/guide/login/
   *
   * @param   {Request}   request     Request object
   * @param   {Response}  response    Response object
   */
  callback: function callback(request, response) {
    sails.services.passport.callback(request, response, function callback(error, user) {

      // User must be active
      if (user && !user.active) {
        return response.forbidden({
          message: 'Account is not activated.'
        });
      }


      request.login(user, function callback(error) {
        // If an error was thrown, redirect the user to the login which should
        // take care of rendering the error messages.
        if (error) {
          sails.log.verbose('User authentication failed');
          sails.log.verbose(error);

          response.json(401, error);
        } else { // Upon successful login, send back user data and JWT token


          response.json(200, {
            user: user,
            token: sails.services.token.issue(_.isObject(user.id) ? JSON.stringify(user.id) : user.id)
          });
        }
      });
    });
  },

  /**
   * Action to check if given password is same as current user password. Note that
   * this action is only allowed authenticated users. And by default given password
   * is checked against to current user.
   *
   * @param   {Request}   request     Request object
   * @param   {Response}  response    Response object
   */
  checkPassword: function checkPassword(request, response) {
    /**
     * Job to fetch current user local passport data. This is needed
     * to validate given password.
     *
     * @param {Function}  next  Callback function
     */
    var findPassport = function findPassport(next) {
      var where = {
        user: request.token,
        protocol: 'local'
      };

      sails.models.passport
        .findOne(where)
        .exec(function callback(error, passport) {
          if (error) {
            next(error);
          } else if (!passport) {
            next({message: 'Given authorization token is not valid'});
          } else {
            next(null, passport);
          }
        })
      ;
    };

    /**
     * Job to validate given password against user passport object.
     *
     * @param {sails.model.passport}  passport  Passport object
     * @param {Function}              next      Callback function
     */
    var validatePassword = function validatePassword(passport, next) {
      var password = request.param('password');

      passport.validatePassword(password, function callback(error, matched) {
        if (error) {
          next({message: 'Invalid password'});
        } else {
          next(null, matched);
        }
      });
    };

    /**
     * Main callback function which is called when all specified jobs are
     * processed or an error has occurred while processing.
     *
     * @param   {null|Error}    error   Possible error
     * @param   {null|boolean}  result  If passport was valid or not
     */
    var callback = function callback(error, result) {
      if (error) {
        response.json(401, error);
      } else if (result) {
        response.json(200, result);
      } else {
        response.json(400, {message: 'Given password does not match.'});
      }
    };

    // Run necessary tasks and handle results
    async.waterfall([findPassport, validatePassword], callback);
  }
};

module.exports = AuthController;

/**
 * Created by shirish on 13/11/13.
 */

var request = require('superagent')
    , Errors = require('../model/errors').errors

var moduleName = module.exports.name = 'remoteUser';

var authConfig = null;


module.exports.init = function (appLoader) {
    appLoader.hook(appLoader.events.config, { priority: 1, name: moduleName }, function (app, config) {
        load(app, config);
    })
}


var load = module.exports.load = function (app, config) {
    authConfig = config.app.auth;
}

var checkConfig = function () {
    if(authConfig === null) {
        throw new Error('Module not configured: ' + moduleName);
    }
}


module.exports.authenticate = function (userId, password, callback) {
    checkConfig();

    request
        .post(authConfig.uri + '/user/authentication')
        .auth(authConfig.clientId, authConfig.clientSecret)
        .send({
            userId: userId,
            password: password
        })
        .set('Accept', 'application/json')
        .end(function (err, res) {
            if(err) {
                return callback(Errors.AUTH_UNAVAILABLE, false, { message: Errors.AUTH_UNAVAILABLE.m });
            }
            if (res.ok) {
                return callback(null, res.body);
            }
            return callback(Errors.USER_NOT_FOUND, false);
        });
}


module.exports.fetchToken = function (userId, password, callback) {
    checkConfig();

    request
        .post(authConfig.uri + '/token')
        .auth(authConfig.clientId, authConfig.clientSecret)
        .send({
            grant_type: 'password',
            username: userId,
            password: password
        })
        .set('Accept', 'application/json')
        .end(function (err, res) {
            if(err) {
                return callback(Errors.AUTH_UNAVAILABLE, false, { message: Errors.AUTH_UNAVAILABLE.m });
            }
            if (res.ok) {
                return callback(null, res.body);
            }
            return callback(Errors.USER_NOT_FOUND, false);
        });
}


module.exports.register = function (userId, password, callback) {
    checkConfig();

    request
        .post(authConfig.uri + '/user')
        .auth(authConfig.clientId, authConfig.clientSecret)
        .send({
            userId: userId,
            password: password
        })
        .set('Accept', 'application/json')
        .end(function (err, res) {
            if(err) {
                return callback(Errors.AUTH_UNAVAILABLE, false);
            }
            if (res.ok) {
                return callback(null, res.body);
            }
            return callback(Errors.USER_NOT_FOUND, false);
        });
}
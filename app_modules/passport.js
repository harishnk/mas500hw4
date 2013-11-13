/**
 * Created by shirish on 4/11/13.
 */

var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy
    , RemoteUser = require('../app_modules/remoteUser')


var User = require('../model/user').User
    , Errors = require('../model/errors').errors


var moduleName = module.exports.name = 'passport';


module.exports.init = function (appLoader) {
    appLoader.hook(appLoader.events.config, { priority: 1, name: moduleName }, function (app, config) {
        load(app, config);
    });

    appLoader.hook(appLoader.events.session, { priority: 2, name: moduleName }, function (app, config) {
        app.use(passport.initialize());
        app.use(passport.session());
    });
}


var load = module.exports.load = function (app, config) {
    registerStrategies(config);
}


function registerStrategies(config) {
    passport.use(new LocalStrategy(function (username, password, done) {
            RemoteUser.authenticate(username, password, function (err, token) {
                if(err || !token) {
                    return done(null, false, { message: (err && err.m || Errors.AUTH_FAIL.m ) });
                }

                User.findOne({ userId: username }, function (err, userDoc) {
                    if (err || !userDoc) {
                        return done(null, false, { message: (err && err.m || Errors.USER_NOT_FOUND.m ) });
                    }
                    return done(null, userDoc.toObject());
                });
            });
        }
    ));

    passport.serializeUser(function (user, done) {
        var sessionObj = {
            userId: user.userId
        };
        return done(null, sessionObj);
    });

    passport.deserializeUser(function (sessionObj, done) {
        User.findOne({ userId: sessionObj.userId }, function (err, userDoc) {
            if (err || !userDoc) {
                return done(err || Errors.USER_NOT_FOUND, false);
            }
            return done(null, userDoc.toObject());
        });
    });

}
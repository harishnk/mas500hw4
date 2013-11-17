/**
 * Created by shirish on 4/11/13.
 */

var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy
    , LinkedInStrategy = require('passport-linkedin-oauth2').Strategy
    , RemoteUser = require('../app_modules/remoteUser')
    , util = require('util')


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

    passport.use(new LinkedInStrategy({
            clientID: config.linkedin.apiKey,
            clientSecret: config.linkedin.apiSecret,
            callbackURL: config.linkedin.callbackURL,
            scope: config.linkedin.scope,
            profileFields: config.linkedin.profileFields
        },
        function(accessToken, refreshToken, profile, done) {
            delete profile._raw;

            User.createOrUpdate(accessToken, refreshToken, profile, function (err, userDoc, created) {
                if (err || !userDoc) {
                    console.log('createOrUpdate', err);
                    return done(null, false, { message: ((err && err.m) || err)  });
                }
                return done(null, userDoc.toObject());
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
                console.log('deserializeUser', err);
                return done(err || Errors.USER_NOT_FOUND, false);
            }
            return done(null, userDoc.toObject());
        });
    });

}
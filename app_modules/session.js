/**
 * Created by shirish on 4/11/13.
 */

var express = require('express')
    , flash = require('connect-flash')
    , utils = require('../lib/utils')


var moduleName = module.exports.name = 'session';

var redisModule = 'connect-redis';


module.exports.init = function (appLoader) {
    appLoader.hook(appLoader.events.session, { priority: 0, name: moduleName }, function (app, config) {
        load(app, config);
    });
}


var load = module.exports.load = function (app, config) {

    var sessionConfig = config.app.session || {
        key: '_sess',
        secret: 's3ss10ns3cr34'
    };

    if (typeof config.redis === 'object' && utils.moduleExists(redisModule)) {
        console.log('Using redis as session store');
        var RedisStore = require(redisModule)(express);
        sessionConfig.store = new RedisStore(config.redis);
    } else {
        console.log('Using memory as session store');
    }

    app.use(express.cookieParser());
    app.use(express.session(sessionConfig));
    app.use(flash());
}

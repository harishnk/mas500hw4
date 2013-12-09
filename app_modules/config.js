var _ = require('lodash')
    , conf = require('../config')
    , util = require('util')
    , debug = require('debug')('config')


function dump(name, obj) {
    if (arguments.length == 1) {
        obj = name;
        name = '';
    }
    debug(name, util.inspect(obj, { depth: null }));
}


function overrideProps(dest, overrides) {
    _.merge(dest, overrides, function(destVal, overrideVal) {
        if (!!overrideVal && !_.isObject(overrideVal)) {
            // if it's an array or a value, assign
            return overrideVal;
        }
    });
}


function mergeObjects() {
    var mergeArgs = _.toArray(arguments);
    mergeArgs.push(function(destVal, defVal) {
        if (_.isArray(defVal) || !_.isObject(defVal) || _.isArray(destVal) || !_.isObject(destVal)) {
            return destVal || defVal;
        }
    });
    return _.merge.apply(this, mergeArgs);
}

var options = {
    defaultsProp: 'defaults',
    overridesProp: 'overrides',
    envList: [ 'production', 'development', 'test' ],
    activeEnv: process.env.NODE_ENV,
    skipOverrides: false
};


function ConfigLoader() {

    var self = this;

    Object.keys(options).forEach(function(k) {
        self[k] = conf[k] || options[k];
    });

    this.activeEnv = conf.activeEnv;
    this.config = {};

};


ConfigLoader.prototype.hasConfig = function() {
    return _.isObject(this.config) && !_.isEmpty(this.config);
}


ConfigLoader.prototype.forceEnv = function(env, skipOverrides) {
    this.checkInit();
    this.checkEnv(env);

    this.activeEnv = env;
    this.skipOverrides = skipOverrides || options.skipOverrides;
    return this;
}


ConfigLoader.prototype.checkInit = function() {
    if (this.hasConfig()) {
        throw new Error('module already configured');
    }
}


ConfigLoader.prototype.checkEnv = function(env) {
    if (!_.contains(this.envList, env || this.activeEnv)) {
        throw new Error('Invalid env: ' + env || this.activeEnv);
    }
}


ConfigLoader.prototype.load = function() {

    this.checkInit();
    this.checkEnv();

    this.config = {};

    var self = this;

    _.each(conf, function(serviceConf, service) {  // service = app, db, redis, mail

        if (!_.isObject(serviceConf)) {
            return; //skip
        }

        self.config[service] = serviceConf[self.activeEnv] || {};

        // merge given config with given defaults
        if (_.isObject(serviceConf.defaults)) {
            mergeObjects(self.config[service], serviceConf.defaults || {});
        }

        // check for overrides and apply
        if (!self.skipOverrides && _.isObject(serviceConf.overrides)) {
            overrideProps(self.config[service], serviceConf.overrides);
        }
    });

    return this;
}


ConfigLoader.prototype.getConfig = function() {
    if (!this.hasConfig()) {
        throw new Error('module not configured');
    }
    return this.config;
}


ConfigLoader.prototype.getEnv = function() {
    if (!this.hasConfig()) {
        throw new Error('module not configured');
    }
    return this.activeEnv;
}

ConfigLoader.prototype.print = function() {
    if (!this.hasConfig()) {
        throw new Error('module not configured');
    }
    dump(this.config);
}


ConfigLoader.prototype.init = function(appLoader) {
    if (!appLoader || !appLoader.hook) {
        return this.load();
    }

    var self = this;
    appLoader.hook(appLoader.events.init, { priority: 0, name: moduleName }, function(app) {
        self.load();
    });
}


var configLoader = new ConfigLoader();

var moduleName = module.exports.name = 'config';

module.exports.ConfigLoader = ConfigLoader;

[ 'forceEnv', 'init', 'getConfig', 'getEnv', 'print' ].forEach(function(f) {
    module.exports[f] = configLoader[f].bind(configLoader);
});

/**
 * Created by shirish on 4/11/13.
 */

var PEventEmitter = require('../lib/PEventEmitter').PEventEmitter
    , util = require('util')
    , utils = require('../lib/utils')
    , path = require('path')
    , debug = require('debug')('routeLoader')


var moduleName = module.exports.name = 'routeLoader';

module.exports.init = function(appLoader) {
    appLoader.hook(appLoader.events.router, { priority: 5, name: moduleName }, function(app, config) {
        load(app, config);
    });
}


var load = module.exports.load = function(app, config) {
    var routeLoader = new RouteLoader(app, config);
    routeLoader.boot();
}

var routeTypes = module.exports.routeTypes = [ 'public', 'validate', 'private' ];


function RouteLoader(app, config) {
    RouteLoader.super_.call(this);

    this.eventList = routeTypes;

    this.events = {};

    var self = this;
    self.eventList.forEach(function(v) {
        self.events[v] = v;
    });

    this.app = app;
    this.config = config;
}

util.inherits(RouteLoader, PEventEmitter);


RouteLoader.prototype.emitEvent = function(event) {
    this.emit(event, this.app, this.config || {});
}


RouteLoader.prototype.registerModules = function() {
    var appModulesPath = path.join(this.config.app.env.rootDir, 'routes');
    var maxDepth = 1;

    var self = this;
    utils.loadModules(appModulesPath, maxDepth, function(module, modulePath) {
        if (typeof module.routeOrder !== 'number') {
            debug('routeOrder not specified. Skipped loading routes in %s', modulePath);
            return;
        }

        routeTypes.forEach(function(rType) {
            var fnRoute = module[rType];
            if (typeof fnRoute === 'function') {
                self.hook(rType, { priority: module.routeOrder, name: module.moduleName }, fnRoute.bind(module));
            }
        });
    });

    this.finalizeListeners();
}


RouteLoader.prototype.start = function() {
    var self = this;
    routeTypes.forEach(function(rType) {
        self.emitEvent(rType);
    });
}


RouteLoader.prototype.boot = function() {
    this.registerModules();
    this.start();
//    this.debug();
}

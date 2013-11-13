var PEventEmitter = require('./lib/PEventEmitter').PEventEmitter
    , util = require('util')
    , utils = require('./lib/utils')
    , path = require('path')
    , Config = require('./app_modules/config')
    , express = require('express')
    , namespace = require('express-namespace')
    , debug = require('debug')('app')


var eventTypes = [ 'init', 'config', 'db', 'session', 'static', 'router', 'setup', 'start', 'moduleError' ];

var modules = [
    { dir: 'app_modules', searchDepth: 1 }
];

var exitOnModuleFail = true;


function AppLoader(eventTypes, modules, exitOnModuleFail) {
    AppLoader.super_.call(this);

    this.modules = modules;
    this.exitOnModuleFail = exitOnModuleFail;

    this.eventList = eventTypes;
    this.events = {};

    var self = this;
    this.eventList.forEach(function (v) {
        self.events[v] = v;
    });

    this.waitTimeout = 5000;
    this.app = express();
};

util.inherits(AppLoader, PEventEmitter);


AppLoader.prototype.init = function () {
    this.dispatchEvent(this.events.init);
    this.config = Config.getConfig();
    this.env = Config.getEnv();
    this.dispatchEvent(this.events.config);
}


AppLoader.prototype.start = function () {
    var port = this.config.app.env.port;

    var self = this;
    this.app.listen(port, function () {
        console.log('Express server listening on port ' + port);
        self.dispatchEvent(self.events.start);
    });
}


AppLoader.prototype.setup = function () {
    var app = this.app;
    var config = this.config;

    app.set('views', config.app.env.rootDir + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());

    app.use(express.urlencoded());
    app.use(express.json());

    app.use(express.methodOverride());

    this.dispatchEvent(this.events.session);

    var publicFolder = path.join(config.app.env.rootDir, 'public');
    app.use(express.static(publicFolder));

    this.dispatchEvent(this.events.router);
    app.use(app.router);

    this.dispatchEvent(this.events.setup);
}


AppLoader.prototype.dispatchEvent = function (event) {
    this.emitEvent(event, this.app, this.config || {});
}


AppLoader.prototype.registerModules = function () {
    if (!this.modules || !this.modules.length) {
        return;
    }

    var self = this;
    modules.forEach(function (mod) {
        var modulesPath = path.join(__dirname, mod.dir);
        utils.loadModules(modulesPath, mod.searchDepth, function (module) {
            if (typeof module.init === 'function') {
                module.init(self);
            }
        });
    });

    this.finalizeListeners();
}


AppLoader.prototype.boot = function () {
    var self = this;
    this.on(appLoader.coreEvents.error, function (err, moduleName) {
        if (err instanceof Error) {
            console.log('ModuleError ' + moduleName, err.message);
        } else {
            console.log('ModuleError ' + moduleName, err);
        }

        if (self.exitOnModuleFail) {
            process.exit(-1);
        }
    });

    this.on(appLoader.coreEvents.done, function () {
        self.start();
    });

    this.registerModules();
    this.debug();
    this.init();
    this.setup();
    this.checkWaitComplete();
}


var appLoader = new AppLoader(eventTypes, modules, exitOnModuleFail);
appLoader.boot();


// For test-hooks
module.exports.appLoader = appLoader;
module.exports.app = appLoader.app;

/**
 * Created by shirish on 3/11/13.
 */

var ResponseHandler = require('./responseExt').ResponseHandler
    , debug = require('debug')('express')


var errorView = 'error.jade';


var moduleName = module.exports.name = 'express';

/**
 *
 * @param appLoader
 */
module.exports.init = function(appLoader) {

    appLoader.hook(appLoader.events.router, { priority: 1, name: moduleName }, function(app, config) {
        app.disable('x-powered-by');
    });

    appLoader.hook(appLoader.events.router, { priority: 6, name: moduleName }, function(app, config) {
        app.all('*', function(req, res) {
            res.redirect('/');
        });
    });

    appLoader.hook(appLoader.events.setup, { priority: 5, name: moduleName }, function(app, config) {
        if (appLoader.env === 'production') {
            app.use(errorHandler({ errView: errorView }));
        } else {
            app.locals.pretty = true;
            app.use(errorHandler({ errView: errorView, dumpExceptions: true, showStack: true }));
        }
    });
}


function errorHandler(options) {
    options = options || {};

    var showStack = options.showStack
        , dumpExceptions = options.dumpExceptions;

    var errView = options.errView;

    if (!errView) {
        throw new Error('No error view specified.');
    }


    return function(err, req, res, next) {
        res.ext = new ResponseHandler(req, res);

        if (dumpExceptions) {
            debug(err.stack);
            debug('uncaughtException', err.message);
        }

        res.ext.code(res.ext.STATUS.SERVER_ERROR);
        res.ext.view(errView);
        res.ext.viewData({ title: 'Error' });

        if (showStack) {
            res.ext.error(err.stack || '');
        }

        showStack ?
            (res.ext.error(err)) :
            (res.ext.error("There was a server error generating the content."));

        res.ext.render();
    };
};
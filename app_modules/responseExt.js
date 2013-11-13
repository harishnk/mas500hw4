var util = require('util')
    , _ = require('lodash')
    , http = require('http')


var moduleName = module.exports.name = 'responseExt';

module.exports.init = function(appLoader) {
    var self = this;
    appLoader.hook(appLoader.events.router, { priority: 0, name: moduleName }, function(app) {
        self.load(app);
    });
}


module.exports.load = function(app) {
    app.use(function(req, res, next) {
        res.ext = new ResponseHandler(req, res);
        next();
    });
}


// Request props for logging/debugging
const requestProps = [ 'path', 'params', 'query', 'method', 'body', 'headers' ];


// Common http status code. For readability
const STATUSCODES = module.exports.StatusCodes = {
    SUCCESS: 200,
    CREATED: 201,
    ACCEPTED: 202,
    PERM_REDIRECT: 301,
    REDIRECT: 302,
    NOT_MODIFIED: 304,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    TOO_MANY_REQUESTS: 429,
    SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    HTTP_VER_NOT_SUPPORTED: 505,
    BANDWIDTH_EXCEEDED: 509
};


const SUPPORTED_STATUSCODES = _.map(_.keys(http.STATUS_CODES), function(code) {
    return _.parseInt(code);
});

const DEFAULT_SUCCESS_CODE = STATUSCODES.SUCCESS
    , DEFAULT_ERROR_CODE = STATUSCODES.BAD_REQUEST;


function print(name, obj) {
    if (arguments.length == 1) {
        obj = name;
        name = '';
    }
    console.log(name, util.inspect(obj, { depth: null }));
}


function mergeData(store, data) {
    if (!_.isObject(data)) {
        return store;
    }
    store = _.merge(store || {}, data);
    return store;
}


function jsonResponse(resHandler) {
    // merge flash data and resData
    if (_.isObject(resHandler.reqFlashData)) {
        resHandler.resData = mergeData(resHandler.resData, resHandler.reqFlashData);
    }

    var responseObj = {
        meta: resHandler.meta,
        response: resHandler.resData || {}
    };

    if (resHandler.hasErrors) {
        responseObj.errors = resHandler.errors;
    }

    resHandler.meta.statusCode = (resHandler.meta.statusCode < STATUSCODES.BAD_REQUEST)
        ? DEFAULT_SUCCESS_CODE : resHandler.meta.statusCode;
    resHandler.res.json(resHandler.meta.statusCode, responseObj);

    // debug
    if (resHandler.enableDebug) {
        print('----');
        print('req.method', resHandler.req.method);
        print('req.path', resHandler.req.path);
        print('response.body', responseObj);
        print('----');
    }
}


function htmlResponse(resHandler) {
    // redirect
    if (_.isString(resHandler.redirectPath)) {
        return resHandler.res.redirect(resHandler.redirectPath);
    }

    var res = resHandler.res;

    // Setup res.locals
    if (_.isObject(resHandler.resLocals)) {
        res.locals = mergeData(res.locals, resHandler.resLocals);
    }

    var viewData = mergeData(resHandler.resData || {}, resHandler.resViewData || {});

    if (resHandler.hasErrors) {
        viewData.errors = resHandler.errors;
    }

    res.status(resHandler.meta.statusCode);
    res.render(resHandler.renderView, viewData);

    // debug
    if (resHandler.enableDebug) {
        print('----');
        print('req.method', resHandler.req.method);
        print('req.path', resHandler.req.path);
        print('meta', resHandler.meta);
        print('renderView', resHandler.renderView);
        print('viewData', viewData);
        print('res.locals', resHandler.res.locals);
        print('----');
    }
}


var ResponseHandler = module.exports.ResponseHandler = function(req, res) {

    this.STATUS = STATUSCODES;

    this.req = _.pick(req, requestProps);
    this.res = res;

    this.meta = null;

    this.resView = null;
    this.resErrView = null;
    this.renderView = null;

    this.reqFlashData = null;
    this.resData = null;
    this.resLocals = null;
    this.resViewData = null;
    this.errors = null;

    this.redirectPath = null;

    // flags
    this.resJson = false;
    this.hasErrors = false;
    this.enableDebug = false;


    // if connect-flash exists
    if (req.flash) {
        this.reqFlash = req.flash.bind(req);
    } else {
        this.reqFlash = function() {
            // do nothing, dummy
        }
    }

    if (_.contains(req.headers.accept || '', 'json')) {
        this.json();
    }
};


// http status code for response
ResponseHandler.prototype.code = function(statusCode) {
    if (!_.isNumber(statusCode) || !_.contains(SUPPORTED_STATUSCODES, statusCode)) {
        throw new Error('Non-numeric or invalid status code: ' + statusCode);
    }

    this.meta = this.meta || {};
    this.meta.statusCode = statusCode;
    this.meta.status = (statusCode >= 400) ? 'error' : 'success';
    return this;
}


// view to be used for errors
ResponseHandler.prototype.errorView = function(view) {
    if (!_.isString(view)) {
        throw new Error('Invalid errorView specified: ' + view);
    }

    this.resErrView = view;
    return this;
}


// view to be used for success
ResponseHandler.prototype.view = function(view) {
    if (!_.isString(view)) {
        throw new Error('Invalid view specified: ' + view);
    }

    this.resView = view;
    if (!this.resErrView) {
        this.resErrView = view;
    }
    return this;
}


// output: json, even if client requested html
ResponseHandler.prototype.json = function(val) {
    this.resJson = _.isBoolean(val) ? val : true;
    return this;
}


// res.locals.*
ResponseHandler.prototype.locals = function(data) {
    this.resLocals = mergeData(this.resLocals, data);
    return this;
}


// res.render('view', *) and res.json(*)
ResponseHandler.prototype.data = function(data, addToLocals) {
    this.resData = mergeData(this.resData, data);
    if (addToLocals) {
        this.locals(data);
    }
    return this;
}


// res.render('view', *)
ResponseHandler.prototype.viewData = function(data, addToLocals) {
    this.resViewData = mergeData(this.resViewData, data);
    if (addToLocals) {
        this.locals(data);
    }
    return this;
}


// req.flash('accountApproved', *) and res.json(*)
ResponseHandler.prototype.flash = function(key, value) {
    var fl = {};
    fl[key] = value;
    this.reqFlashData = mergeData(this.reqFlashData, fl);
    this.reqFlash(key, value);
    return this;
}


ResponseHandler.prototype.error = function(err) {
    if (!err) {
        throw new Error('No error specified');
    }

    this.errors = this.errors || [];
    if (_.isArray(err)) {
        this.errors = _.union(this.errors, err);
    } else {
        this.errors.push(err.toString());
    }
    return this;
}


ResponseHandler.prototype.debug = function(val) {
    this.enableDebug = !!val;
    return this;
}


ResponseHandler.prototype.exec = function(delayed) {
    var respExc = new ResponseExecutor(this);
    if (_.isBoolean(delayed) && delayed) {
        return respExc;
    }
    return respExc.done();
}


ResponseHandler.prototype.render = function(delayed) {
    return this.exec(delayed || false);
}


ResponseHandler.prototype.redirect = function(redirectPath, delayed) {
    if (!_.isString(redirectPath)) {
        throw new Error('No redirectPath specified');
    }
    this.code(this.STATUS.REDIRECT);
    this.redirectPath = redirectPath;

    return this.exec(delayed || false);
}


function ResponseExecutor(resHandler) {

    this.done = function() {
        resHandler.hasErrors = _.isArray(resHandler.errors) && (resHandler.errors.length > 0);

        if (!_.isObject(resHandler.meta)) {
            resHandler.hasErrors ? resHandler.code(DEFAULT_ERROR_CODE) : resHandler.code(DEFAULT_SUCCESS_CODE);
        }

        resHandler.renderView = resHandler.hasErrors ? resHandler.resErrView : resHandler.resView;

        if (resHandler.resJson || (!resHandler.redirectPath && !resHandler.renderView)) {
            // if response type is json, or no view has been specified for a non-redirect response, assume json response
            jsonResponse(resHandler);
        } else {
            htmlResponse(resHandler);
        }
    }

};
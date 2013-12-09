/**
 * Created by shirish on 12/11/13.
 */

var Validator = require('validator').Validator
    , _  = require('lodash')


var moduleName = module.exports.name = 'validator';


module.exports.init = function (appLoader) {
    appLoader.hook(appLoader.events.config, { priority: 0, name: moduleName }, function (app, config) {
        load(app, config);
    });
}


var load = module.exports.load = function (app, config) {
    Validator.prototype.hasError = function () {
        return !!(this._errors.length);
    }

    Validator.prototype.error = function (msg) {
        if (!_.contains(this._errors, msg)) {
            this._errors.push(msg);
        }
        return this;
    }

    Validator.prototype.getErrors = function () {
        return this._errors;
    }
}
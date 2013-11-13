/**
 * Created by shirish on 5/11/13.
 */

var mongoose = require('mongoose')
    , debug = require('debug')('mongoose')


var moduleName = module.exports.name = 'mongoose';


module.exports.init = function (appLoader) {
    var waitKey = appLoader.hook(appLoader.events.config, { priority: 0, name: moduleName, wait: true }, function (app, config, callback) {
        load(app, config, appLoader, waitKey, callback);
    });
}


var load = module.exports.load = function (app, config, appLoader, waitKey, callback) {
    var dbUri = config.db.dbUri;

    mongoose.connect(dbUri, function (err) {
        if (err) {
            debug(err);
            return callback(err, waitKey);
        }
        console.log('Connected to %s', dbUri);
        appLoader.dispatchEvent(appLoader.events.db);
        return callback(null, waitKey);
    });
}
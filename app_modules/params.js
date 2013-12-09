/**
 * Created by shirish on 4/11/13.
 */

var debug = require('debug')('params')


var moduleName = module.exports.moduleName = 'params';


module.exports.init = function(appLoader) {
    appLoader.hook(appLoader.events.router, { priority: 2, name: moduleName }, function(app, config) {
        load(app, config);
    });
}


var load = module.exports.load = function(app, config) {

}

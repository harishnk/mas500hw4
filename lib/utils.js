/**
 * Created by shirish on 4/11/13.
 */

var fs = require('fs')
    , path = require('path')
    , util = require('util')


var dump = module.exports.dump = function(name, obj) {
    if (arguments.length == 1) {
        obj = name;
        name = '';
    }
    console.log(name, util.inspect(obj, { depth: null }));
}


var loadModules = module.exports.loadModules = function(modulePath, maxDepth, fn) {
    --maxDepth;
    fs.readdirSync(modulePath).forEach(function(file) {
        var newPath = path.join(modulePath, file);
        var stat = fs.statSync(newPath);
        if (stat.isFile()) {
            if (/(.*)\.(js|coffee)/.test(file)) {
                fn(require(newPath), newPath);
            }
        } else if (stat.isDirectory() && maxDepth > 0) {
            loadModules(newPath, maxDepth, fn);
        }
    });
}


module.exports.moduleExists = function(module) {
    try {
        require.resolve(module);
        return true;
    } catch (ignored) {
    }
    return false;
}

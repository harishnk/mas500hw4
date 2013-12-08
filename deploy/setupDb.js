var exec = require('child_process').exec
  , fs = require('fs')
  , url = require('url')
  , path = require('path')
  , configLoader = require('../app_modules/config')

var confFilename = 'dbConfig.js';
var setupFilename = 'mongodbSetup.js';
var mongoCmd = 'mongo';

var envDbUri = process.env.MONGODB_URI;
var setupUseEnv = process.env.SETUPDB_USE_ENV || false;

var dbConfig = {};
var hostList = {};
var parsedConfig;

var doneList = {};

if((setupUseEnv === 'true' || setupUseEnv === '1') && !!envDbUri) {
  console.warn('WARNING: process.env.SETUPDB_USE_ENV active');
  parsedConfig = parseUri(envDbUri);
  if(parsedConfig) {
    var envConfKey = confKey(parsedConfig);
    dbConfig['env'] = hostList[envConfKey] = parsedConfig;
    console.warn('WARNING: Using process.env.MONGODB_URI');
  }
} else {
    (configLoader.getEnvList() || []).forEach(function(env) {
        if(env === configLoader.getDefaultsProp())    return;
        parsedConfig = parseUri(configLoader.reset().forceEnv(env, true).init().getConfig().db.dbUri);
        if(!parsedConfig) {
            return;
        }
        hostList[confKey(parsedConfig)] = parsedConfig;
        dbConfig[env] = parsedConfig;
    });
}


fs.writeFileSync(confFilename, 'var dbConfig = ' + JSON.stringify(dbConfig) + ';');
var setupFilePath = path.join(__dirname, setupFilename);
console.log(dbConfig);

Object.keys(hostList).forEach(function(k) {
  var conf = hostList[k];
  var cmd = mongoCmd + ' --port ' + conf.port + ' --host ' + conf.host + ' "' + setupFilePath + '"';
  console.log('Executing:', cmd);

  var child = exec(cmd, function (error, stdout, stderr) {
    if(stdout) console.log('stdout: ' + stdout);
    if(stderr) console.log('stderr: ' + stderr);
    if(error) console.log('error: ' + error);
  });
});

function confKey(dbConfig) {
  return dbConfig.host + ':' + dbConfig.port;
}

function parseUri(dbUri) {
  var dbUri, auth;
  try {
    dbUri = url.parse(dbUri);
    auth = dbUri.auth.split(':');

    return {
      host: dbUri.hostname,
      port: dbUri.port,
      user: auth.shift(),
      password: auth.join(':'),
      db: dbUri.pathname.replace(/^\//, '')
    };
  } catch(e) {
    return false;
  }

}
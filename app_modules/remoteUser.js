/**
* Created by shirish on 13/11/13.
*/

var request = require('superagent')
    , Errors = require('../model/errors').errors


var moduleName = module.exports.name = 'remoteUser';

var config = null;


module.exports.init = function (appLoader) {
    appLoader.hook(appLoader.events.config, { priority: 1, name: moduleName }, function (app, config) {
        load(app, config);
    })
}


var load = module.exports.load = function (app, conf) {
    config = conf;
}

var checkConfig = function () {
    if(config === null) {
        throw new Error('Module not configured: ' + moduleName);
    }
}


module.exports.fetchProfile = function (accessToken, callback) {
    checkConfig();

    var linkedinConfig = config.linkedin;
    var url = linkedinConfig.apiRoot + '/people/~:(' + linkedinConfig.profileFields.join(',') + ')?format=json';
    url += '&secure-urls=true&oauth2_access_token=' + encodeURIComponent(accessToken);

    request
        .get(url)
        .set('Accept', 'application/json')
        .end(function (err, res) {
            if(err) {
                console.log('remoteUser-err', err);
                return callback(Errors.INVALID_LINKEDIN_PROFILE);
            }
            if (res.ok) {
                var json = res.body;
                var profile = { provider: 'linkedin' };
                profile.id = json.id;
                profile.displayName = json.firstName + ' ' + json.lastName;
                profile.name = { familyName: json.lastName, givenName: json.firstName };
                if (json.emailAddress) { profile.emails = [{ value: json.emailAddress }]; }
                profile._json = json;
                return callback(null, profile);
            }
            return callback(Errors.INVALID_LINKEDIN_PROFILE);
        });
}

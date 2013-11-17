/**
 * Created by shirish on 8/11/13.
 */

var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , Errors = require('./errors').errors
    , _ = require('lodash')



var userSchema = new Schema({
    userId:         { type: String, required: true, index: { unique: true } },
    linkedinId:     { type: String, required: true, index: { unique: true } },
    email:          { type: String, required: true },
    fname:          { type: String },
    lname:          { type: String },
    displayName:    { type: String, required: true },
    profile:        { type: Schema.Types.Mixed, required: true },
    accessToken:    { type: String, required: true },
    refreshToken:   { type: String, required: true },
    created:        { type: Date, required: true, default: Date.now },
    modified:       { type: Date }
});


const MAP_PROFILE_ATTRS = {
    linkedinId: 'id',
    userId: 'id',
    email: 'emailAddress',
    fname: 'firstName',
    lname: 'lastName'
};

const PWD_HASH_LEN = 8;


userSchema.methods.buildFromAttrs = function (userAttrs) {
    if (typeof userAttrs !== 'object') {
        return;
    }

    var schemaAttrs = Object.keys(userSchema.paths);
    var self = this;
    schemaAttrs.forEach(function (k) {
        if (typeof userAttrs[k] !== 'undefined') {
            self[k] = userAttrs[k];
        }
    });
}


userSchema.statics.register = function (userAttrs, callback) {
    var newUser = new User();
    newUser.buildFromAttrs(userAttrs);
    newUser.save(function (err) {
       if (err) {
           return callback(Errors.DB_FAIL.debug(err));
       }
       return callback(null, newUser, true);
    });
}


userSchema.statics.createOrUpdate = function (accessToken, refreshToken, profile, callback) {
    if (typeof profile !== 'object' || !profile._json.id || !accessToken) {
        return callback(Errors.INVALID_LINKEDIN_PROFILE.debug(profile));
    }

    var userAttrs = {
        displayName:    profile.displayName,
        profile:        profile._json,
        accessToken:    accessToken,
        modified:       Date.now()
    };

    if (!!refreshToken) {
        userAttrs.refreshToken = refreshToken;
    }

    var updates = {
        $set: userAttrs
    };

    var self = this;
    this.findOneAndUpdate({ linkedinId: profile._json.id }, updates, function (err, userDoc) {
        if (err) {
            return callback(Errors.DB_FAIL.debug(err));
        }

        if (!!userDoc) {
            return callback(null, userDoc, false);
        }

        // Create new user
        delete userAttrs.modified;
        userAttrs.created = Date.now();

        Object.keys(MAP_PROFILE_ATTRS).forEach(function (k) {
            userAttrs[k] = profile._json[MAP_PROFILE_ATTRS[k]];
        });

        return self.register(userAttrs, callback);
    });
}


var User = module.exports.User = mongoose.model('user', userSchema, 'user');
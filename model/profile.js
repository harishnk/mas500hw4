

var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , Errors = require('./errors').errors
    , _ = require('lodash')


var profileSchema = new Schema({
    linkedinId:             { type: String, required: true, index: { unique: true } },
    firstName:              { type: String },
    lastName:               { type: String },
    formattedName:          { type: String },
    industry:               { type: String },
    headline:               { type: String },
    pictureUrl:             { type: String },
    numConnections:         { type: Number },
    numConnectionsCapped:   { type: Boolean },
    relationToViewer:       { type: Schema.Types.Mixed },
    location:               { type: Schema.Types.Mixed },
    positions:              { type: Schema.Types.Mixed }
});

const PROFILE_ATTRS = module.exports.PROFILE_ATTRS = _.keys(profileSchema.paths);


profileSchema.statics.new = function (profileAttrs, callback) {
    if (profileAttrs.id) {
        profileAttrs.linkedinId = profileAttrs.id;
        delete profileAttrs.id;     
    }

    var profile = new Profile();
    profile = _.merge(profile, _.pick(profileAttrs, PROFILE_ATTRS));
    profile.save(function (err) {
        if (err) {
            return callback(Errors.DB_FAIL.debug(err));
        }
        return callback(null, profile, true);
    });
}


profileSchema.statics.createIfNotExists = function (profileAttrs, callback) {
    if (profileAttrs.id) {
        profileAttrs.linkedinId = profileAttrs.id;
        delete profileAttrs.id;
    }

    var self = this;
    this.findOne({ linkedinId: profileAttrs.linkedinId }, function (err, profileDoc) {
        if (err) {
            return callback(Errors.DB_FAIL.debug(err));
        }

        if (profileDoc) {
            return callback(null, profileDoc, false);
        }

        return self.new(profileAttrs, callback);
    });
}


profileSchema.statics.createOrUpdate = function (profileAttrs, callback) {
    if (profileAttrs.id) {
        profileAttrs.linkedinId = profileAttrs.id;
        delete profileAttrs.id;
    }

    profileAttrs = _.pick(profileAttrs, PROFILE_ATTRS);

    var updates = {
        $set: profileAttrs
    };

    var self = this;
    this.findOneAndUpdate({ linkedinId: profileAttrs.linkedinId }, updates, function (err, profileDoc) {
        if (err) {
            return callback(Errors.DB_FAIL.debug(err));
        }

        if (profileDoc) {
            return callback(null, profileDoc, false);
        }

        return self.new(profileAttrs, callback);
    });
}


var Profile = module.exports.Profile = mongoose.model('profile', profileSchema, 'profile');
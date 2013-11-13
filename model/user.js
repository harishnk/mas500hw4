/**
 * Created by shirish on 8/11/13.
 */

var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , Errors = require('./errors').errors
    , _ = require('lodash')



var userSchema = new Schema({
    userId: { type: String, required: true, index: { unique: true } },
    fname:  { type: String },
    lname:  { type: String },
    email:  { type: String, required: true }
});


userSchema.statics.register = function (userAttrs, callback) {
    var newUser = new User();
    newUser.userId = userAttrs.userId;
    newUser.fname = userAttrs.fname;
    newUser.lname = userAttrs.lname;
    newUser.email = userAttrs.email;

    newUser.save(function (err) {
       if (err) {
           return callback(Errors.DB_FAIL.debug(err));
       }
       return callback(null, newUser);
    });
}


var User = module.exports.User = mongoose.model('user', userSchema, 'user');
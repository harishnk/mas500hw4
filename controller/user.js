/**
 * Created by shirish on 5/11/13.
 */

var Validator = require('validator').Validator
    , request = require('superagent')
    , configLoader = require('../app_modules/config')
    , debug = require('debug')('controller-user')


var User = require('../model/user').User
    , RemoteUser = require('../app_modules/remoteUser')
    , Errors = require('../model/errors').errors


function UserController() {

}


UserController.prototype.register = function (req, res) {
    var config = configLoader.getConfig();

    var validator = new Validator();
    validator.check(req.body.username, 'Invalid username').len(5, 64);
    validator.check(req.body.password, 'Invalid password').len(5, 64);
    validator.check(req.body.fname, 'Invalid first name').len(1, 64);
    validator.check(req.body.lname, 'Invalid last name').len(1, 64);
    validator.check(req.body.email, 'Invalid e-mail address').len(5, 64).isEmail();

    if (validator.hasError()) {
        return res.ext.error(validator.getErrors()).view('error').render();
    }

    req.body.userId = req.body.username;
    delete req.body.username;

    RemoteUser.register(req.body.userId, req.body.password, function (err, token) {
        if (err) {
            return res.ext.error(err).view('error').render();
        }

        User.register(req.body, function (err, newUser) {
            if (err) {
                return res.ext.error(err).view('error').render();
            }

            req.logIn(newUser, function(err) {
                if (err){
                    return res.ext.error(err).view('error').render();
                }

                return res.ext.redirect('/');
            });
        });
    });
}



module.exports.UserController = new UserController();
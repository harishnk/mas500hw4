var passport = require('passport')
    , login = require('connect-ensure-login')

var UserController = require('../controller/user').UserController


var moduleName = module.exports.moduleName = 'web';

module.exports.routeOrder = 0;


module.exports.public = function (app, config) {
    app.get('/login', function (req, res) {
        if(req.isAuthenticated()) {
            return res.ext.redirect('/');
        }
        res.ext.data({ errors: req.flash('error') }).view('signin').render();
    });

    app.post('/login', passport.authenticate('local',
        {
            successRedirect: '/',
            failureRedirect: '/login',
            failureFlash: true
        }
    ));


    app.get('/register', function (req, res) {
        if(req.isAuthenticated()) {
            return res.ext.redirect('/');
        }
        res.ext.view('register').render();
    });

    app.post('/register', UserController.register.bind(UserController));
}


module.exports.validate = function (app, config) {
    app.all('/*', login.ensureLoggedIn('/login'), function (req, res, next) {
       next();
    });
}


module.exports.private = function (app, config) {
    app.all('/logout', function (req, res) {
        req.logout();
        res.ext.redirect('/');
    });

    app.all('/', function (req, res) {
        res.ext.data({ data: req.user }).view('index').render();
    });
}
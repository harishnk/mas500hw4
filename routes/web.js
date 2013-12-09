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

    app.get('/register', function (req, res) {
        if(req.isAuthenticated()) {
            return res.ext.redirect('/');
        }
        res.ext.view('register').render();
    });

    app.post('/register', UserController.register.bind(UserController));

// GET /auth/linkedin
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in LinkedIn authentication will involve
//   redirecting the user to linkedin.com.  After authorization, LinkedIn will
//   redirect the user back to this application at /auth/linkedin/callback
    app.get('/auth/linkedin',
        passport.authenticate('linkedin', { state: config.linkedin.state }));

// GET /auth/linkedin/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
    app.get('/auth/linkedin/callback',
        passport.authenticate('linkedin', { successRedirect: '/', failureRedirect: '/login', failureFlash: true }),
        function(err, req, res, next) {
            console.log('err', err)
            res.redirect('/');
        });
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
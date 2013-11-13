/**
 * Created by shirish on 8/11/13.
 */


var errors = {}, errorMsgs = {};
errorMsgs['DB_FAIL'] = "Storage error. Please try again later.";
errorMsgs['CLIENT_NOT_FOUND'] = "Invalid client";
errorMsgs['TOKEN_NOT_FOUND'] = "Invalid token";
errorMsgs['USER_NOT_FOUND'] = "Invalid user";
errorMsgs['USER_REG_ERROR'] = "Error registering user";
errorMsgs['AUTH_FAIL'] = "Invalid username or password";
errorMsgs['AUTH_UNAVAILABLE'] = "System unavailable. Please try again later.";

Object.keys(errorMsgs).forEach(function (err) {
    var e = new Error(err);
    e.id = err;
    e.m = errorMsgs[err];
    e.d = null;
    e.e = null;
    e.error = function (e) {
        this.e = e;
        return this;
    }
    e.debug = function (d) {
        this.d = d;
        return this;
    };
    e.toString = function () {
        return e.m;
    };

    errors[err] = e;
});


module.exports = {
    errors: errors
}

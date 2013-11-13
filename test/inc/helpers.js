/**
 * Created by shirish on 10/11/13.
 */

var superchai = require('supertest-chai')
    , request = superchai.request
    , chai = require("chai");

chai.Assertion.includeStack = true;
module.exports.should = chai.should();
chai.use(superchai.httpAsserts);

var UserAgent = function (a) {

    var app = a;
    var cookies;

    this.request = function (options) {
        var withLastState = options && options.useSavedState;
        return {
            get: function (path) {
                var req = request(app).get(path);
                return this.attachState(req);
            },
            post: function (path) {
                var req = request(app).post(path);
                return this.attachState(req);
            },
            attachState: function (req) {
                if (!withLastState) return req;
                cookies && (req.cookies = cookies);
                return req;
            }
        };
    }

    this.saveState = function (res) {
        var header_cookies = res.headers['set-cookie'];
        if (!header_cookies) return;
        cookies = header_cookies.pop().split(';')[0];
    }
};


module.exports.UserAgent = UserAgent;
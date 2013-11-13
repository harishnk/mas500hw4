/**
 * Created by shirish on 9/11/13.
 */

var mongoose = require('mongoose');

var clearDB = module.exports.clearDB = function (done) {
    var collections = Object.keys(mongoose.connection.collections);
    var totalOps = collections.length;
    var i = 0;
    collections.forEach(function (c) {
        mongoose.connection.collections[c].remove(function (e) {
            if (e) console.log(e);
            if (++i === totalOps) {
                done && done();
            }
        });
    });
}

module.exports.findOne = function (collec, query, callback) {
    mongoose.connection.db.collection(collec, function (err, collection) {
        if (err) {
            return callback(err);
        }
        collection.findOne(query, callback);
    });
};

module.exports.find = function (collec, query, callback) {
    mongoose.connection.db.collection(collec, function (err, collection) {
        if (err) {
            return callback(err);
        }
        collection.find(query, callback);
    });
};


var self = this;

module.exports.init = function (dbUri) {

    console.log('dbUri', dbUri);

    before(function (done) {
        checkState(dbUri, done);
    });

    after(function (done) {
        mongoose.disconnect();
        return done();
    });

    return self;
}


function reconnect(dbUri, done) {
    console.log('Connecting to ', dbUri);
    mongoose.connect(dbUri, function (err) {
        if (err) {
            throw err;
        }
        console.log('Connected to database ', dbUri);
        return done();
    });
}

function checkState(dbUri, done) {
    switch (mongoose.connection.readyState) {
        case 0:
            reconnect(dbUri, done);
            break;
        case 1:
            done();
            break;
        default:
            setImmediate(function () {
                checkState(dbUri, done);
            });
    }
}
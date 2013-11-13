module.exports.activeEnv = process.NODE_ENV || 'development';


module.exports.app = {};

module.exports.app.defaults = {
    env: {
        port: process.env.PORT || 3000,
        rootDir: __dirname
    },
    api: {
        version: '1',
        path: '/api/v1'
    },
    auth: {
        uri: 'http://127.0.0.1:5555/api/v1',
        clientId: 'surveyengine',
        clientSecret: 'magneto87'
    }
};


module.exports.db = {};

module.exports.db.defaults = {
    dbUri: "mongodb://app1:swbo10a87@127.0.0.1:18001/survey_dev"
};

module.exports.db.overrides = {
    dbUri: "mongodb://app1:swbo10a87@127.0.0.1:18001/survey_dev"
}

module.exports.db.production = {
    dbUri: process.env.MONGODB_URI
};

module.exports.db.development = {
    dbUri: "mongodb://app1:swbo10a87@127.0.0.1:18001/survey_dev"
};

module.exports.db.test = {
    dbUri: "mongodb://app1:swbo10a87@127.0.0.1:18001/survey_test"
};


module.exports.redis = {};

module.exports.redis.defaults = {
    host: '127.0.0.1',
    port: '6379'
};

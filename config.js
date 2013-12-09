module.exports.activeEnv = process.env.NODE_ENV || 'development';

var port = process.env.PORT || 3000;

module.exports.app = {};

module.exports.app.defaults = {
    env: {
        port: port,
        rootDir: __dirname
    },
    api: {
        version: '1',
        path: '/api/v1'
    }
};


module.exports.db = {};

module.exports.db.defaults = {
    dbUri: "mongodb://app1:swbo10a87@127.0.0.1:18001/survey_dev"
};

module.exports.db.production = {
    dbUri: process.env.MONGODB_URI
};

module.exports.db.test = {
    dbUri: "mongodb://app1:swbo10a87@127.0.0.1:18001/survey_test"
};


module.exports.linkedin = {};

module.exports.linkedin.defaults = {
    state: 's0m3c0mpl3xs3cr34',
    apiRoot: 'https://api.linkedin.com/v1',
    apiKey: '75f8nwd5xkko4v',
    apiSecret: 'z5AMlvIiFv4CpWXN',
    callbackURL: 'http://127.0.0.1:' + port + '/auth/linkedin/callback',
    scope: [
        'r_fullprofile',
        'r_emailaddress',
        'r_contactinfo',
        'r_network',
        'rw_groups'
    ],
    profileFields: [
        'id',
        'first-name',
        'last-name',
        'maiden-name',
        'formatted-name',
        'phonetic-first-name',
        'phonetic-last-name',
        'formatted-phonetic-name',
        'headline',
        'location',
        'industry',
        'distance',
        'relation-to-viewer:(distance)',
        'current-share',
        'num-connections',
        'num-connections-capped',
        'summary',
        'specialties',
        'positions',
        'picture-url',
        'site-standard-profile-request',
        'api-standard-profile-request:(url,headers)',
        'public-profile-url',
        'last-modified-timestamp',
        'proposal-comments',
        'associations',
        'interests',
        'publications',
        'patents',
        'languages',
        'skills',
        'certifications',
        'educations',
        'courses',
        'volunteer',
        'three-current-positions',
        'three-past-positions',
        'num-recommenders',
        'recommendations-received',
        'mfeed-rss-url',
        'following',
        'job-bookmarks',
        'suggestions',
        'date-of-birth',
        'member-url-resources',
        'related-profile-views',
        'honors-awards',
        'email-address',
        'phone-numbers',
        'bound-account-types',
        'im-accounts',
        'main-address',
        'twitter-accounts',
        'primary-twitter-account',
        'connections',
        'group-memberships'
    ],
    connProfileFields: [
        'id',
        'first-name',
        'last-name',
        'maiden-name',
        'formatted-name',
        'phonetic-first-name',
        'phonetic-last-name',
        'formatted-phonetic-name',
        'headline',
        'location',
        'industry',
        'distance',
        'relation-to-viewer:(distance)',
        'current-share',
        'num-connections',
        'num-connections-capped',
        'summary',
        'specialties',
        'positions',
        'picture-url',
        'site-standard-profile-request',
        'api-standard-profile-request:(url,headers)',
        'public-profile-url'
    ]
};


module.exports.linkedin.production = {
    apiKey: '75qhsxeag6smel',
    apiSecret: 'F0FxGXrGMRpegpi4',
    callbackURL: 'http://buggycoder.com:' + port + '/auth/linkedin/callback'
};
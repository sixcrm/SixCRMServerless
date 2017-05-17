'use strict'
const fs = require('fs');
const yaml = require('js-yaml');
const _ = require('underscore');

require('../routes.js');

const tu = global.routes.include('lib','test-utilities.js');
const timestamp = global.routes.include('lib','timestamp.js');
const du = global.routes.include('lib','debug-utilities.js');

process.env.SIX_VERBOSE = 2;

let site_config = yaml.safeLoad(fs.readFileSync(__dirname+'/../config/development/site.yml', 'utf8'));
let now = timestamp.createTimestampSeconds();

let secret_key = site_config.jwt.auth0.secret_key;
let email = process.argv[2];

if(_.isUndefined(email) || _.isNull(email)){
    email = 'super.user@test.com';
}

let jwt_contents = {
    "email": email,
    "email_verified": true,
    "picture": "",
    "iss": "https://sixcrm.auth0.com/",
    "sub": "",
    "aud": "",
    "exp": (now+3600),
    "iat": now
};

du.output('Note:  The Auth0 JWT gereated is similiar, but not identical.');
du.output(tu.generateJWT(jwt_contents, secret_key));

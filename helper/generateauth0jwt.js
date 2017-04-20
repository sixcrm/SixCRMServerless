const fs = require('fs');
const yaml = require('js-yaml');

const tu = require('../lib/test-utilities.js');
const timestamp = require('../lib/timestamp.js');
const du = require('../lib/debug-utilities.js');

let site_config = yaml.safeLoad(fs.readFileSync(__dirname+'/../config/development/site.yml', 'utf8'));
let now = timestamp.createTimestampSeconds();

let secret_key = site_config.jwt.auth0.secret_key;
let email = process.argv[2];

if(typeof email == 'undefined'){
    email = 'super.user@test.com';
}

let jwt_contents = {
    "email": "test@test.com",
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
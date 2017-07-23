'use strict'
const fs = require('fs');
const yaml = require('js-yaml');
const _ = require('underscore');

require('../SixCRM.js');

const du = global.SixCRM.routes.include('lib','debug-utilities.js');
const jwtutilities = global.SixCRM.routes.include('lib', 'jwt-utilities.js');

let site_config = yaml.safeLoad(fs.readFileSync(global.SixCRM.routes.path('config', 'development/site.yml'), 'utf8'));

process.env.SIX_VERBOSE = 2;
process.env.site_jwt_expiration = site_config.jwt.site.expiration;
process.env.jwt_issuer = site_config.jwt.issuer;

let email = process.argv[2];
let signing_string = process.argv[3];

if(_.isUndefined(email) || _.isNull(email)){
    du.error('You must specify a user email.')
}

if(_.isUndefined(signing_string) || _.isNull(signing_string)){
    du.error('You must specify a signing string.')
}

process.env.site_jwt_secret_key = signing_string;

jwtutilities.setParameters();

let jwt = jwtutilities.getJWT({user:{email: email}}, 'site');
let decoded = jwtutilities.verifyJWT(jwt, 'site');

du.output('Decoded JWT: ', decoded);
du.output('JWT: ', jwt);

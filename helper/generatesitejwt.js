'use strict'
const _ = require('underscore');

require('../SixCRM.js');

const du = global.SixCRM.routes.include('lib','debug-utilities.js');
const jwtutilities = global.SixCRM.routes.include('lib', 'jwt-utilities.js');

let site_config = global.SixCRM.configuration.site_config;

process.env.SIX_VERBOSE = 2;
process.env.site_jwt_expiration = site_config.jwt.site.expiration;
process.env.site_jwt_secret_key = site_config.jwt.site.secret_key;
process.env.jwt_issuer = site_config.jwt.issuer;

let email = process.argv[2];

if(_.isUndefined(email) || _.isNull(email)){
    email = 'super.user@test.com';
}

jwtutilities.setParameters();

let jwt = jwtutilities.getJWT({user:{email: email}}, 'site');
let decoded = jwtutilities.verifyJWT(jwt, 'site');

du.output('Decoded JWT: ', decoded);
du.output('JWT: ', jwt);

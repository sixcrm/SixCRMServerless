'use strict'
const fs = require('fs');
const _ = require('underscore');

require('../SixCRM.js');

const du = global.SixCRM.routes.include('lib','debug-utilities.js');
const jwtutilities = global.SixCRM.routes.include('lib', 'jwt-utilities.js');

let site_config = yaml.safeLoad(fs.readFileSync(global.SixCRM.routes.path('config', 'development/site.yml'), 'utf8'));

process.env.SIX_VERBOSE = 2;
process.env.transaction_jwt_expiration = site_config.jwt.transaction.expiration;
process.env.transaction_jwt_secret_key = site_config.jwt.transaction.secret_key;
process.env.jwt_issuer = site_config.jwt.issuer;

let email = process.argv[2];

if(_.isUndefined(email) || _.isNull(email)){
    email = 'super.user@test.com';
}

jwtutilities.setParameters();

let jwt = jwtutilities.getJWT({user:{email: email}}, 'transaction');
let decoded = jwtutilities.verifyJWT(jwt, 'transaction');

du.output('Decoded JWT: ', decoded);
du.output('JWT: ', jwt);

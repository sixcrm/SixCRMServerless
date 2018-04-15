
const _ = require('lodash');

require('../SixCRM.js');

const du = global.SixCRM.routes.include('lib','debug-utilities.js');
const JWTProvider = global.SixCRM.routes.include('controllers', 'providers/jwt-provider.js');
const jwtprovider = new JWTProvider();

let site_config = global.SixCRM.configuration.site_config;

process.env.SIX_VERBOSE = 2;
process.env.transaction_jwt_expiration = site_config.jwt.transaction.expiration;
process.env.transaction_jwt_secret_key = site_config.jwt.transaction.secret_key;
process.env.jwt_issuer = site_config.jwt.issuer;

let email = process.argv[2];

if(_.isUndefined(email) || _.isNull(email)){
    email = 'super.user@test.com';
}

jwtprovider.setParameters();

let jwt = jwtprovider.getJWT({user:{email: email}}, 'transaction');
let decoded = jwtprovider.verifyJWT(jwt, 'transaction');

du.output('Decoded JWT: ', decoded);
du.output('JWT: ', jwt);

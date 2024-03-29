
const _ = require('lodash');

require('@6crm/sixcrmcore');

const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const JWTProvider = global.SixCRM.routes.include('controllers', 'providers/jwt-provider.js');
const jwtprovider = new JWTProvider();

let site_config = global.SixCRM.configuration.site_config;

process.env.SIX_VERBOSE = 2;
process.env.site_jwt_expiration = site_config.jwt.site.expiration;
process.env.site_jwt_secret_key = site_config.jwt.site.secret_key;
process.env.jwt_issuer = site_config.jwt.issuer;

let email = process.argv[2];

if(_.isUndefined(email) || _.isNull(email)){
	email = 'super.user@test.com';
}

jwtprovider.setParameters();

let jwt = jwtprovider.getJWT({user:{email: email}}, 'site');
let decoded = jwtprovider.verifyJWT(jwt, 'site');

du.info('Decoded JWT: ', decoded);
du.info('JWT: ', jwt);

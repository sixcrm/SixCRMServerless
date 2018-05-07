
const _ = require('lodash');

require('../SixCRM.js');

const du = global.SixCRM.routes.include('lib','debug-utilities.js');
const JWTProvider = global.SixCRM.routes.include('controllers', 'providers/jwt-provider.js');
const jwtprovider = new JWTProvider();

let site_config = global.SixCRM.configuration.site_config;

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

jwtprovider.setParameters();

let jwt = jwtprovider.getJWT({user:{email: email}}, 'site');
let decoded = jwtprovider.verifyJWT(jwt, 'site');

du.info('Decoded JWT: ', decoded);
du.info('JWT: ', jwt);

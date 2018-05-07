
const _ = require('lodash');

require('../SixCRM.js');

var timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const du = global.SixCRM.routes.include('lib','debug-utilities.js');
const signatureutilities = global.SixCRM.routes.include('lib', 'signature.js');

process.env.SIX_VERBOSE = 2;

let access_key = process.argv[2];
let secret_key = process.argv[3];
let request_time = process.argv[4];

if(_.isUndefined(access_key) || _.isNull(access_key)){
	du.error('You must specify a user access_key.');
	process.exit();
}

if(_.isUndefined(secret_key) || _.isNull(secret_key)){
	du.error('You must specify a secret_key.');
	process.exit();
}

if(_.isUndefined(request_time) || _.isNull(request_time)){
	request_time = timestamp.createTimestampMilliseconds();
}

let signature = signatureutilities.createSignature(secret_key, request_time);

du.info('Signature: ', signature);
du.info('Validated: ', signatureutilities.validateSignature(secret_key, request_time, signature));
du.info([access_key, request_time, signature].join(':'));


require('@sixcrm/sixcrmcore');
const _ = require('lodash');

const random = require('@sixcrm/sixcrmcore/util/random').default;
const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;

process.env.SIX_VERBOSE = 2;

let string_length = 10;

if(!_.isUndefined(process.argv[2])){
	string_length = process.argv[2];
}

du.info(random.createRandomString(string_length));


const uuidV4 = require('uuid/v4');
const _ = require('lodash');

require('@6crm/sixcrmcore');

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;

process.env.SIX_VERBOSE = 2;

let count = process.argv[2];

if(_.isUndefined(count)){
	count = 1;
}

for(var i = 0; i < count; i++){
	du.info(uuidV4());
}

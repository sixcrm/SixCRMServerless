
require('@6crm/sixcrmcore');
const qs = require('querystring');
const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;

let input_string = process.argv[2];

du.info(qs.escape(input_string));

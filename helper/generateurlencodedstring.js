
require('@sixcrm/sixcrmcore');
const qs = require('querystring');
const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;

let input_string = process.argv[2];

du.info(qs.escape(input_string));

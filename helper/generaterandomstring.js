
require('../SixCRM.js');
const _ = require('underscore');

const random = global.SixCRM.routes.include('lib', 'random');
const du = global.SixCRM.routes.include('lib','debug-utilities.js');

process.env.SIX_VERBOSE = 2;

let string_length = 10;

if(!_.isUndefined(process.argv[2])){
    string_length = process.argv[2];
}

du.output(random.createRandomString(string_length));

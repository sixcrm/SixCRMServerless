'use strict'
require('../SixCRM.js');
const qs = require('querystring');
const du = global.SixCRM.routes.include('lib','debug-utilities.js');

let input_string = process.argv[2];

du.immutable(qs.escape(input_string));

'use strict'
require('../SixCRM.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const du = global.SixCRM.routes.include('lib','debug-utilities.js');

process.env.SIX_VERBOSE = 2;
du.output(timestamp.getISO8601());

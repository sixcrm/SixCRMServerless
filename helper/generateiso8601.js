'use strict'
require('../routes.js');
const timestamp = global.routes.include('lib', 'timestamp.js');
const du = global.routes.include('lib','debug-utilities.js');

process.env.SIX_VERBOSE = 2;
du.output(timestamp.getISO8601());

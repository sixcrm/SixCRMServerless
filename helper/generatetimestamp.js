'use strict'

require('../routes.js');

process.env.SIX_VERBOSE = 2;
const timestamp = global.routes.include('lib','timestamp.js');
const du = global.routes.include('lib','debug-utilities.js');

du.output(timestamp.createTimestampSeconds());

var timestamp = require('../lib/timestamp.js');
const du = require('../lib/debug-utilities.js');

process.env.SIX_VERBOSE = 2;
du.output(timestamp.getISO8601());

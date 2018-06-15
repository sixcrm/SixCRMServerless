
require('@sixcrm/sixcrmcore');
const timestamp = require('@sixcrm/sixcrmcore/util/timestamp').default;
const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;

process.env.SIX_VERBOSE = 2;
du.info(timestamp.getISO8601());

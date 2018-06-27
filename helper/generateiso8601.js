
require('@6crm/sixcrmcore');
const timestamp = require('@6crm/sixcrmcore/util/timestamp').default;
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;

process.env.SIX_VERBOSE = 2;
du.info(timestamp.getISO8601());

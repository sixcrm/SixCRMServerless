

require('@6crm/sixcrmcore');

process.env.SIX_VERBOSE = 2;
const timestamp = require('@6crm/sixcrmcore/lib/util/timestamp').default;
const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;

du.info(timestamp.createTimestampSeconds());

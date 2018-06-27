

require('@6crm/sixcrmcore');

process.env.SIX_VERBOSE = 2;
const timestamp = require('@6crm/sixcrmcore/util/timestamp').default;
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;

du.info(timestamp.createTimestampSeconds());

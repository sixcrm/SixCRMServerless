

require('@sixcrm/sixcrmcore');

process.env.SIX_VERBOSE = 2;
const timestamp = require('@sixcrm/sixcrmcore/util/timestamp').default;
const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;

du.info(timestamp.createTimestampSeconds());

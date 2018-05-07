

require('../SixCRM.js');

process.env.SIX_VERBOSE = 2;
const timestamp = global.SixCRM.routes.include('lib','timestamp.js');
const du = global.SixCRM.routes.include('lib','debug-utilities.js');

du.info(timestamp.createTimestampSeconds());

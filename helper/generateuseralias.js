
require('../SixCRM.js');

const du = global.SixCRM.routes.include('lib','debug-utilities.js');
const mungeutilities = global.SixCRM.routes.include('lib','munge-utilities.js');

let email = process.argv[2];

process.env.SIX_VERBOSE = 2;
du.info(mungeutilities.munge(email));

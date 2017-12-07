'use strict'
require('../SixCRM.js');

const du = global.SixCRM.routes.include('lib','debug-utilities.js');
const RebillStateToRedshiftController = global.SixCRM.routes.include('controllers', 'workers/rebillStateToRedshift.js');

process.env.SIX_VERBOSE = 2;

new RebillStateToRedshiftController().execute().then((result) => {

    return result;

}).catch((error) =>{

    du.warning('Error:', error);

});

'use strict'
require('../SixCRM.js');

const du = global.SixCRM.routes.include('lib','debug-utilities.js');
const RebillStateToRedshiftController = global.SixCRM.routes.include('controllers', 'workers/rebillStateToRedshift.js');


new RebillStateToRedshiftController().execute().then((result) => {

    return result;

}).catch((error) =>{

    du.warning('Error:', error);

});

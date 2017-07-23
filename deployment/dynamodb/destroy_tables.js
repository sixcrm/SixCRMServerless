'use strict';
require('../../SixCRM.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const dynamodeploymentutilities = global.SixCRM.routes.include('deployment', 'utilities/dynamo-deploy-tables');

du.highlight('Destroying DynamoDB Tables');
dynamodeploymentutilities.deleteAll();

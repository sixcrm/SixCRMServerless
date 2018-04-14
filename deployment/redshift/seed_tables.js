require('../../SixCRM.js');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const RedshiftSchemaDeployment = global.SixCRM.routes.include('deployment', 'utilities/redshift-schema-deployment.js');
const redshiftSchemaDeployment = new RedshiftSchemaDeployment();

redshiftSchemaDeployment.seed().then((result) => {
  return du.highlight(result);
}).catch(error => {
  du.error(error);
  du.warning(error.message);
});

'use strict'
require('../../SixCRM.js');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const dynamoDBDeployment = global.SixCRM.routes.include('deployment', 'utilities/dynamodb-deployment.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');

let configuration = {
  branch: 'development',
  version: null
};

let cli_parameters = {
  'branch': /^--branch=.*$/,
  'version': /^--version=.*$/
}

objectutilities.map(cli_parameters, key => {

  let regex = cli_parameters[key];

  arrayutilities.find(process.argv, (argument) => {
    if(stringutilities.isMatch(argument, regex)){
      configuration[key] = argument.split('=')[1];
      return true;
    }
    return false;
  });

});

dynamoDBDeployment.backupTables(configuration).then((result) => {
  du.highlight(result);
}).catch(error => {
  du.error(error);
  du.warning(error.message);
});

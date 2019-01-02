
require('@6crm/sixcrmcore');

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const DynamoDBDeployment = global.SixCRM.routes.include('deployment', 'utilities/dynamodb-deployment.js');
const dynamoDBDeployment = new DynamoDBDeployment();
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const stringutilities = require('@6crm/sixcrmcore/util/string-utilities').default;

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
	return du.info(result);
}).catch(error => {
	du.error(error);
	du.warning(error.message);
});

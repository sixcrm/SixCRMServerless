require('@sixcrm/sixcrmcore');

const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;

const objectutilities = require('@sixcrm/sixcrmcore/util/object-utilities').default;
const arrayutilities = require('@sixcrm/sixcrmcore/util/array-utilities').default;
const stringutilities = require('@sixcrm/sixcrmcore/util/string-utilities').default;

const AWSDeploymentUtilities = global.SixCRM.routes.include('deployment', 'utilities/aws-deployment-utilities.js');

let configuration = {
	branch: 'development'
};

let cli_parameters = {
	'branch': /^--branch=.*$/
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

let awsdu = new AWSDeploymentUtilities();

awsdu.setRole(configuration.branch).then(() => {

	du.info('Role Updated.');
	du.info(process.env);

	return true;

}).catch(error => {

	du.error(error);
	du.warning(error.message);

});

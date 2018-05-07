require('../../SixCRM.js');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');

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

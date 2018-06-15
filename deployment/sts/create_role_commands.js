require('@sixcrm/sixcrmcore');

const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;

const objectutilities = require('@sixcrm/sixcrmcore/util/object-utilities').default;
const arrayutilities = require('@sixcrm/sixcrmcore/util/array-utilities').default;
const stringutilities = require('@sixcrm/sixcrmcore/util/string-utilities').default;
const fileutilities = require('@sixcrm/sixcrmcore/util/file-utilities').default;

const AWSDeploymentUtilities = global.SixCRM.routes.include('deployment', 'utilities/aws-deployment-utilities.js');

let configuration = {
	branch: 'development'
};

let cli_parameters = {
	'branch': /^--branch=.*$/,
	'output': /^--output=.*$/
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

function transformToBash(role_json){

	let commands = [
		'export AWS_ACCESS_KEY_ID='+role_json.Credentials.AccessKeyId,
		'export AWS_SECRET_ACCESS_KEY='+role_json.Credentials.SecretAccessKey,
		'export AWS_SESSION_TOKEN='+role_json.Credentials.SessionToken
	];

	return arrayutilities.compress(commands, "\n", "");

}

awsdu.getRoleCredentials(configuration.branch).then((result) => {

	du.debug(result);
	return fileutilities.writeFile(configuration.output, transformToBash(result));

}).catch(error => {

	du.error(error);
	du.warning(error.message);

});

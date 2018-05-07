
const _ = require('lodash');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const STSProvider = global.SixCRM.routes.include('controllers', 'providers/sts-provider.js');

module.exports = class AWSDeploymentUtilities {

	constructor(){

		this.stsprovider = new STSProvider();

		//Deprecated:  In use for ONLY the oldest services
		this.parameter_groups = {
			security_group: {
				create: {
					required:['Description', 'GroupName', 'VpcId']
				},
				create_ingress_rules: {
					required:['GroupId'],
					optional:['CidrIp','FromPort','ToPort','IpProtocol','SourceSecurityGroupName','SourceSecurityGroupOwnerId','IpPermissions']
				},
				create_egress_rules: {
					required:['GroupId'],
					optional:['CidrIp','FromPort','ToPort','IpProtocol','SourceSecurityGroupName','SourceSecurityGroupOwnerId','IpPermissions']
				},
				delete: {
					required:['GroupName'],
					optional:['GroupId', 'DryRun']
				}
			}
		}

	}

	getRoleCredentials(environment_key){

		du.debug('Get Role Credentials');

		du.debug('Environment Key: '+environment_key);

		let assume_role_parameters = this.getEnvironmentAssumedRoleParameters(environment_key);

		du.debug('Role Parameters: ', assume_role_parameters);

		return this.stsprovider.assumeRole(assume_role_parameters).then(result => {

			mvu.validateModel(result, global.SixCRM.routes.path('model', 'deployment/sts/assumedroleresponse.json'));

			return result;

		});

	}

	setRole(environment_key){

		du.debug('Set Role');

		let assume_role_parameters = this.getEnvironmentAssumedRoleParameters(environment_key);

		return this.stsprovider.assumeRole(assume_role_parameters).then(result => {

			return this.setAssumedRoleProperties(result);

		}).catch(error => {
			du.error(error);
		});

	}

	setAssumedRoleProperties(assumed_role_json){

		du.debug('Set Assumed Role Properties');

		mvu.validateModel(assumed_role_json, global.SixCRM.routes.path('model', 'deployment/sts/assumedroleresponse.json'));

		process.env.AWS_ACCESS_KEY_ID = assumed_role_json.Credentials.AccessKeyId;
		process.env.AWS_SECRET_ACCESS_KEY = assumed_role_json.Credentials.SecretAccessKey;
		process.env.AWS_SESSION_TOKEN = assumed_role_json.Credentials.SessionToken;

		return true;

	}

	getEnvironmentAssumedRoleParameters(environment_key){

		let environments_json = global.SixCRM.routes.include('deployment', 'sts/config/accounts.json');

		if(!_.has(environments_json.deployment_accounts, environment_key)){
			throw eu.getError('server', 'Unknown deployment environment: '+environment_key);
		}

		let account_id = environments_json.deployment_accounts[environment_key].account_id;
		let role_name = global.SixCRM.configuration.site_config.sts.deployment_role_name;
		let external_id = environments_json.deployment_accounts[environment_key].external_id;

		return {
			RoleArn:'arn:aws:iam::'+account_id+':role/'+role_name,
			ExternalId: external_id
		};

	}

	createParameterGroup(action, subaction, object){

		du.debug('Create Parameter Group');

		if(!_.has(this.parameter_groups, action)){
			throw eu.getError('server', 'AWSDeploymentUtilities.createParameterGroup assumes parameter group has action property.');
		}
		if(!_.isNull(subaction)){
			if(!_.has(this.parameter_groups[action], subaction)){
				throw eu.getError('server', 'AWSDeploymentUtilities.createParameterGroup assumes parameter group action has property subaction.');
			}
			if(!_.has(this.parameter_groups[action][subaction], 'required')){
				throw eu.getError('server', 'AWSDeploymentUtilities.createParameterGroup assumes parameter group action.subaction has property required.');
			}
		}else{
			if(!_.has(this.parameter_groups[action], 'required')){
				throw eu.getError('server', 'AWSDeploymentUtilities.createParameterGroup assumes parameter group action has property required.');
			}
		}

		let action_settings = {};

		if(_.isNull(subaction)){
			action_settings = this.parameter_groups[action];
		}else{
			action_settings = this.parameter_groups[action][subaction];
		}

		let required_parameters = objectutilities.additiveFilter(action_settings.required, object);

		let optional_parameters = {};

		if(_.has(action_settings, 'optional')){

			optional_parameters = objectutilities.additiveFilter(action_settings.optional, object);

		}

		let merged = objectutilities.merge(required_parameters, optional_parameters);

		return merged;

	}

}

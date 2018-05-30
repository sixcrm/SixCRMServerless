const BBPromise = require('bluebird');
//const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
//const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const parserutilities = global.SixCRM.routes.include('lib', 'parser-utilities.js');
const random = global.SixCRM.routes.include('lib', 'random.js');
const CloudwatchProvider = global.SixCRM.routes.include('controllers', 'providers/cloudwatch-provider.js');
const LambdaProvider = global.SixCRM.routes.include('controllers', 'providers/lambda-provider.js');
const AWSDeploymentUtilities = global.SixCRM.routes.include('deployment', 'utilities/aws-deployment-utilities.js');

module.exports = class CloudwatchDeployment extends AWSDeploymentUtilities{

	constructor() {

		super();

		this.cloudwatchprovider = new CloudwatchProvider();
		this.lambdaprovider = new LambdaProvider();

		this.logger_lambda_name = 'logger';

	}

	deployLoggerPermissions(){

		du.debug('Deploy Logger Permissions');

		const permissions = this.getParametersJSON('permissions');

		let permissions_promises = arrayutilities.map(permissions, (permission) => {

			return () => this.deployLambdaPermission(permission);

		});

		return arrayutilities.serial(permissions_promises).then(() => { return 'Complete'; });

	}

	deployLambdaPermission(permission_definition){

		du.debug('Deploy Lambda Permission');

		let parameters = this.parsePermissionParameters(permission_definition);

		return this.lambdaprovider.putPermission(parameters);

	}

	parsePermissionParameters(permission_definition){

		du.debug('Parse Permission Parameters');

		let data = {
			stage: global.SixCRM.configuration.stage,
			random_string: random.createRandomString(10),
			aws_account_id: global.SixCRM.configuration.site_config.aws.account,
			aws_account_region: global.SixCRM.configuration.site_config.aws.region,
		};

		let parameters = objectutilities.clone(permission_definition);
		objectutilities.map(parameters, (key) => {
			parameters[key] = parserutilities.parse(parameters[key], data);
		});

		return parameters;

	}

	deploySubscriptionFilters(){

		du.debug('Deploy Subscription Filters');

		let lambdas = this.getLambdaFunctions();

		const subscription_filter_template = this.getParametersJSON('subscription_filters_template');

		return BBPromise.each(lambdas, (lambda) =>
			this.deploySubscriptionFilter(lambda, subscription_filter_template));

	}

	async deploySubscriptionFilter(lambda_name, subscription_filter_template) {

		du.debug('Deploy Subscription Filter');

		if(lambda_name == this.logger_lambda_name){
			du.warning('Can not log the errors of the logger (recursive.)');
			return;
		}

		let parameters = this.parseSubscriptionFilterTemplate(lambda_name, subscription_filter_template);

		du.info(parameters);

		if (await this.subscriptionFilterExists(parameters.logGroupName, parameters.filterName)) {
			du.info("Filter exists");
			return;
		}

		return this.cloudwatchprovider.putSubscriptionFilter(parameters);

	}

	async subscriptionFilterExists(logGroupName, filterName) {

		const filters = (await this.cloudwatchprovider.getSubscriptionFilters(logGroupName, filterName)).subscriptionFilters;
		return filters.length > 0 && filters[0].filterName === filterName;

	}

	parseSubscriptionFilterTemplate(lambda_name, subscription_filter_template){

		du.debug('Parse Subscription Filter Template');

		let data = {
			aws_account_id: global.SixCRM.configuration.site_config.aws.account,
			aws_account_region: global.SixCRM.configuration.site_config.aws.region,
			lambda_name: lambda_name,
			logger_lambda_name: this.logger_lambda_name,
			stage_name: global.SixCRM.configuration.stage,
			//Technical Debt:  We may want a less permissioned role here...
			delivery_role_name: 'lambda_role'
		};

		let parameters = objectutilities.clone(subscription_filter_template);
		objectutilities.map(parameters, (key) => {
			parameters[key] = parserutilities.parse(parameters[key], data);
		});

		return parameters;

	}

	getLambdaFunctions(){

		du.debug('Get Lambda Functions');

		let serverless_file = global.SixCRM.routes.include('root', 'serverless.yml');

		return Object.keys(serverless_file.functions)

	}

	getParametersJSON(filename){

		du.debug('Get Parameters JSON');

		//Technical Debt:  This needs to be expanded to support multiple definitions...
		return global.SixCRM.routes.include('deployment', 'cloudwatch/configuration/'+filename+'.json');

	}

}

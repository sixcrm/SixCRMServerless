const _ = require('lodash');

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
//const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
//const randomutilities = require('@6crm/sixcrmcore/util/random').default;
//const fileutilities = require('@6crm/sixcrmcore/util/file-utilities').default;
const parserutilities = require('@6crm/sixcrmcore/util/parser-utilities').default;
//const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;

const AWSDeploymentUtilities = global.SixCRM.routes.include('deployment', 'utilities/aws-deployment-utilities.js');
const DynamoDBProvider = global.SixCRM.routes.include('controllers', 'providers/dynamodb-provider.js');
const LambdaProvider = global.SixCRM.routes.include('controllers', 'providers/lambda-provider.js');

module.exports = class LambdaDeployment extends AWSDeploymentUtilities {

	constructor() {

		super();

		this.lambdaprovider = new LambdaProvider();
		this.dynamodbprovider = new DynamoDBProvider();

	}

	async deployEventSourceMappings(){

		du.debug('Deploy Event Source Mappings');

		//Technical Debt:  Would need to be more robust if more functions required mappings
		let event_source_mappings = global.SixCRM.routes.include('deployment','lambda/event_source_mappings/indexdynamorecords.json');
		let function_name = 'indexdynamorecords';

		let esm_promises = arrayutilities.map(event_source_mappings, event_source_mapping => {
			return () => this.deployEventSourceMapping(function_name, event_source_mapping);
		})

		await arrayutilities.serial(esm_promises);

		return 'Complete';

	}

	async deployEventSourceMapping(function_name, event_source_mapping){

		du.debug('Deploy Event Source Mapping');

		let table_description = await this.dynamodbprovider.describeTable({"TableName": event_source_mapping.TableName});

		if(!_.has(table_description, 'Table')){
			du.warning('Table doesn\'t exist: '+event_source_mapping.TableName);
			return null;
		}

		if(!_.has(table_description.Table, 'LatestStreamArn')){
			du.warning('Table doesn\'t have a stream: '+event_source_mapping.TableName);
			return null;
		}

		let stream_arn = table_description.Table.LatestStreamArn;
		let full_function_name = this.createFullFunctionName(function_name);

		let list_params = {
			EventSourceArn: stream_arn,
			FunctionName: full_function_name
		}

		let event_source_description = await this.lambdaprovider.listEventSourceMappings(list_params);

		if(_.has(event_source_description, 'EventSourceMappings') && _.isArray(event_source_description.EventSourceMappings) && arrayutilities.nonEmpty(event_source_description.EventSourceMappings)){
			du.info('Event Source Mapping exists on function "'+full_function_name+'": '+stream_arn);
			return true;
		}

		du.info('Creating mapping on function "'+full_function_name+'": '+stream_arn);

		let parameters = {
			EventSourceArn: stream_arn,
		  FunctionName: full_function_name,
		  StartingPosition: event_source_mapping.StartingPosition,
		  BatchSize: event_source_mapping.BatchSize,
		  Enabled: event_source_mapping.Enabled
		};

		let result = await this.lambdaprovider.createEventSourceMapping(parameters);

		du.info(result);

		return true;

	}

	createFullFunctionName(function_name){

		du.debug('Create Full Function Name');

		return parserutilities.parse('{{deployment_name}}-{{stage}}-{{function_name}}', {
			deployment_name: 'sixcrm',
			stage: global.SixCRM.configuration.stage,
			function_name: function_name
		});

	}

}

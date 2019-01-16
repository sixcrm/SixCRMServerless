
const _ = require('lodash');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const parserutilities = require('@6crm/sixcrmcore/util/parser-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;

const AWSProvider = global.SixCRM.routes.include('controllers','providers/aws-provider.js');

module.exports = class LambdaProvider extends AWSProvider{

	constructor(){

		super();

		this.lambda_name_template = '{{service}}-{{stage}}-{{shortname}}';

		this.instantiateLambda();

	}

	instantiateLambda(){
		let region = (objectutilities.hasRecursive(global.SixCRM.configuration.site_config, 'lambda.region'))?global.SixCRM.configuration.site_config.lambda.region:this.getRegion();
		let parameters = {
			apiVersion: '2015-03-31',
			region: region
		};

		//Technical Debt:  Get this out of the constructor?
		this.instantiateAWS();

		this.lambda = new this.AWS.Lambda(parameters);

	}

	buildLambdaName(shortname){
		if(!objectutilities.hasRecursive(global, 'SixCRM.configuration.serverless_config.service')){
			throw eu.getError('server', 'Unavailable service name in serverless configuration object');
		}

		if(!objectutilities.hasRecursive(process, 'env.stage')){
			throw eu.getError('server', 'Unavailable environment stage in process');
		}

		let name_parameters = {
			service: global.SixCRM.configuration.serverless_config.service,
			stage: process.env.stage,
			shortname: shortname
		};

		return parserutilities.parse(this.lambda_name_template, name_parameters);

	}

	listEventSourceMappings(parameters){
		return this.lambda.listEventSourceMappings(parameters).promise();

	}

	createEventSourceMapping(parameters){
		return this.lambda.createEventSourceMapping(parameters).promise();

	}

	buildHandlerFunctionName(longname) {
		return longname.replace(/.+-.+-/, ''); // strip out canonical part 'sixcrm-stagename-';
	}

	invokeFunction(parameters, callback){
		return new Promise((resolve, reject) => {

			var params = {
				FunctionName: parameters.function_name,
				Payload: parameters.payload,
				InvocationType: parameters.invocation_type || 'RequestResponse',
				LogType: 'Tail'
			};

			if (process.env.require_local) {

				return this.invokeLocal(params, callback)
					.then((result) => resolve(result))
					.catch((error) => reject(error));

			} else {

				this.lambda.invoke(params, (error, data) => {

					if (error) {

						du.error(error);
						return reject(error);

					}

					return resolve(data);

				});

			}

		});

	}

	invokeLocal(parameters, callback) {
		if (!callback) {
			callback = () => true;
		}

		return new Promise((resolve, reject) => {

			let function_name = this.buildHandlerFunctionName(parameters.FunctionName);
			let lambda = this.getLambdaInstance(function_name);

			// Parameters of every lambda are:
			// 1. serialized event,
			// 2. context,
			// 3. callback to execute with the response
			let serialized_payload = JSON.parse(parameters.Payload);
			let context = {}; // local execution, empty context seems OK
			let lambda_callback = (error, data) => {

				if (error) {
					return reject(callback(error));
				}

				if (data.body && data.body.success && data.body.success === false) {
					return reject(callback(error));
				}

				// AWS Lambda JS SKD does this for us, but when executing locally we need to wrap the response into
				// an object ourselves and execute the main callback manually.
				return resolve(callback(null, {
					StatusCode: 200,
					Payload: data
				}));
			};

			// Finally, we execute the function.
			lambda(serialized_payload, context, lambda_callback);
		});
	}

	getLambdaInstance(lambda_name) {
		let lambda = global.SixCRM.configuration.serverless_config.functions[lambda_name];

		if (lambda.environment) {
			for (let key in lambda.environment) {
				process.env[key] = lambda.environment[key];
			}
		}

		let splitIndex = lambda.handler.indexOf('.');
		let modulePath = lambda.handler.substring(0, splitIndex);
		let methodName = lambda.handler.substring(splitIndex + 1);

		let path = global.SixCRM.routes.root + '/' + modulePath;
		delete require.cache[require.resolve(path)];
		let module = require(path);

		return _.at(module, [methodName])[0];
	}

	buildAddPermissionParameters(parameters){

		let params = {};

		params = objectutilities.transcribe(
			{
				Action:'Action',
				FunctionName:'FunctionName',
				Principal:'Principal',
				StatementId:'StatementId'
			},
			parameters,
			params,
			true
		);

		params = objectutilities.transcribe(
			{
				EventSourceToken: 'EventSourceToken',
				Qualifier: 'Qualifier',
				RevisionId: 'RevisionId',
				SourceAccount: 'SourceAccount',
				SourceArn: 'SourceArn'
			},
			parameters,
			params
		);

		return params;

	}

	putPermission(parameters){
		let add_permission_parameters = this.buildAddPermissionParameters(parameters);

		return this.hasPermission(add_permission_parameters).then(result => {

			if(_.isObject(result) && _.has(result, 'Sid')){
				return result;

			}

			return this.addPermission(add_permission_parameters);

		});

	}

	hasPermission(parameters){
		return this.getPolicy({ FunctionName: parameters.FunctionName }).then(result => {

			if(_.has(result, 'Policy')){

				let parsed_policy;

				try{
					parsed_policy = JSON.parse(result.Policy);
				}catch(error){
					du.error(error);
					throw eu.getError('server', error);
				}

				if(_.has(parsed_policy, 'Statement') && arrayutilities.nonEmpty(parsed_policy.Statement)){

					let found_policy = arrayutilities.find(parsed_policy.Statement, statement_element => {
						if(objectutilities.hasRecursive(statement_element, 'Condition.ArnLike.AWS:SourceArn')){
							if(statement_element.Condition.ArnLike['AWS:SourceArn'] == parameters.SourceArn){
								return true;
							}
						}
						return false;
					});

					if(!_.isUndefined(found_policy) && !_.isNull(found_policy)){
						return found_policy;
					}

				}

			}

			return false;

		}).catch(() => {

			return false;

		});

	}

	getPolicy(parameters){
		let params = objectutilities.transcribe(
			{
				FunctionName: 'FunctionName'
			},
			parameters,
			{},
			true
		);

		params = objectutilities.transcribe(
			{
				Qualifier:'Qualifier'
			},
			parameters,
			params
		);

		return new Promise((resolve, reject) => {

			this.lambda.getPolicy(params, function(error, data) {

				if (error){
					du.error(error);
					return reject(error);
				}

				return resolve(data);

			});

		});

	}

	addPermission(parameters){
		let params = {};

		params = objectutilities.transcribe(
			{
				Action:'Action',
				FunctionName:'FunctionName',
				Principal:'Principal',
				StatementId:'StatementId'
			},
			parameters,
			params,
			true
		);

		params = objectutilities.transcribe(
			{
				EventSourceToken: 'EventSourceToken',
				Qualifier: 'Qualifier',
				RevisionId: 'RevisionId',
				SourceAccount: 'SourceAccount',
				SourceArn: 'SourceArn'
			},
			parameters,
			params
		);

		return new Promise((resolve, reject) => {

			this.lambda.addPermission(params, (error, data) => {

				if(error){
					du.error(error);
					return reject(error);
				}

				return resolve(data);

			});

		});

	}

}

const chai = require('chai');
const expect = chai.expect;
const mockery = require('mockery');

xdescribe('controllers/providers/lambda-provider', () => {

	let require_local_copy;

	before(() => {
		mockery.resetCache();
		mockery.deregisterAll();

		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});

		require_local_copy = process.env.require_local;
	});

	after(() => {
		mockery.disable();
		process.env.require_local = require_local_copy;
	});

	describe('buildLambdaName', () => {

		it('returns lambda name', () => {
			const LambdaProvider = global.SixCRM.routes.include('controllers', 'providers/lambda-provider.js');
			const lambdaprovider = new LambdaProvider();

			expect(lambdaprovider.buildLambdaName('a_lambda_name')).to.equal(
				global.SixCRM.configuration.serverless_config.service +
                '-' + process.env.stage +
                '-a_lambda_name');
		});
	});

	describe('buildHandlerFunctionName', () => {

		it('build handler function name', () => {
			const LambdaProvider = global.SixCRM.routes.include('controllers', 'providers/lambda-provider.js');
			const lambdaprovider = new LambdaProvider();

			expect(lambdaprovider.buildHandlerFunctionName('sixcrm-stagename-name')).to.equal('name');
		});
	});

	xdescribe('invokeFunction', () => {

		it('invokes function', () => {
			const LambdaProvider = global.SixCRM.routes.include('controllers', 'providers/lambda-provider.js');
			const lambdaprovider = new LambdaProvider();

			delete process.env.require_local;

			lambdaprovider.lambda = {
				invoke: function(params, callback) {
					callback(null, 'success');
				}
			};

			return lambdaprovider.invokeFunction({
				function_name: 'deliveredtoarchive',
				payload: '{}'
			}).then((result) => {
				expect(result).to.equal('success');
			});
		});

		xit('invokes function when require local is set to true', (done) => {

			const LambdaProvider = global.SixCRM.routes.include('controllers', 'providers/lambda-provider.js');
			const lambdaprovider = new LambdaProvider();

			process.env.require_local = true;

			let parameters = {
				function_name: 'deliveredtoarchive',
				payload: '{}'
			};

			let callback = (error, data) => {
				expect(data.StatusCode).to.equal(200);
				done();
			};

			let path = global.SixCRM.routes.path('handlers', 'workers/forwardmessage/handlers');

			mockery.registerMock(path, {
				deliveredtoarchive: (payload, context, callback) => {
					expect(payload).to.be.defined;
					expect(context).to.be.defined;
					expect(callback).to.be.defined;

					return callback(null, {body: {success: true}});
				}
			});

			lambdaprovider.invokeFunction(parameters, callback);

		});

		xit('throws error when invoke local failed', (done) => {

			const LambdaProvider = global.SixCRM.routes.include('controllers', 'providers/lambda-provider.js');
			const lambdaprovider = new LambdaProvider();

			process.env.require_local = true;

			let parameters = {
				function_name: 'deliveredtoarchive',
				payload: '{}'
			};

			let callback = (error) => {
				expect(error.StatusCode).to.equal(500);
				done();
			};

			let path = global.SixCRM.routes.path('handlers', 'workers/forwardmessage/handlers');

			mockery.registerMock(path, {
				deliveredtoarchive: (payload, context, callback) => {
					expect(payload).to.be.defined;
					expect(context).to.be.defined;
					expect(callback).to.be.defined;

					return callback({StatusCode: 500}, null);
				}
			});

			lambdaprovider.invokeFunction(parameters, callback).catch(e => {
				expect(e).to.be.defined
			});
		});

		xit('throws error from lambda invoke', () => {
			const LambdaProvider = global.SixCRM.routes.include('controllers', 'providers/lambda-provider.js');
			const lambdaprovider = new LambdaProvider();

			delete process.env.require_local;

			lambdaprovider.lambda = {
				invoke: function(params, callback) {
					callback('fail', null);
				}
			};

			return lambdaprovider.invokeFunction({
				function_name: 'deliveredtoarchive',
				payload: '{}'
			}).catch((error) => {
				expect(error).to.equal('fail');
			});
		});
	});

	describe('addPermission', () => {

		it('successfully adds permission', () => {

			let parameters = {
				Action: 'an_action',
				FunctionName: 'a_function_name',
				Principal: 'a_principal',
				StatementId: 'a_statement_id'
			};

			const LambdaProvider = global.SixCRM.routes.include('controllers', 'providers/lambda-provider.js');
			const lambdaprovider = new LambdaProvider();

			lambdaprovider.lambda = {
				addPermission: function(params, callback) {
					expect(params.Action).to.equal(parameters.Action);
					expect(params.FunctionName).to.equal(parameters.FunctionName);
					expect(params.Principal).to.equal(parameters.Principal);
					expect(params.StatementId).to.equal(parameters.StatementId);
					callback(null, 'any_permission_data');
				}
			};

			return lambdaprovider.addPermission(parameters).then((result) => {
				expect(result).to.equal('any_permission_data');
			});
		});

		it('throws error when permission was not successfully added', () => {

			let parameters = {
				Action: 'an_action',
				FunctionName: 'a_function_name',
				Principal: 'a_principal',
				StatementId: 'a_statement_id'
			};

			const LambdaProvider = global.SixCRM.routes.include('controllers', 'providers/lambda-provider.js');
			const lambdaprovider = new LambdaProvider();

			lambdaprovider.lambda = {
				addPermission: function(params, callback) {
					expect(params.Action).to.equal(parameters.Action);
					expect(params.FunctionName).to.equal(parameters.FunctionName);
					expect(params.Principal).to.equal(parameters.Principal);
					expect(params.StatementId).to.equal(parameters.StatementId);
					callback(new Error('fail'), null);
				}
			};

			return lambdaprovider.addPermission(parameters).catch((error) => {
				expect(error.message).to.equal('fail');
			});
		});
	});

	describe('getPolicy', () => {

		it('successfully retrieves policy', () => {

			let parameters = {
				FunctionName: 'a_function_name',
				Qualifier: 'a_qualifier'
			};

			const LambdaProvider = global.SixCRM.routes.include('controllers', 'providers/lambda-provider.js');
			const lambdaprovider = new LambdaProvider();

			lambdaprovider.lambda = {
				getPolicy: function(params, callback) {
					expect(params.FunctionName).to.equal(parameters.FunctionName);
					expect(params.Qualifier).to.equal(parameters.Qualifier);
					callback(null, 'any_permission_data');
				}
			};

			return lambdaprovider.getPolicy(parameters).then((result) => {
				expect(result).to.equal('any_permission_data');
			});
		});

		it('throws error when policy hasn\'t been successfully retrieved', () => {

			let parameters = {
				FunctionName: 'a_function_name',
				Qualifier: 'a_qualifier'
			};

			const LambdaProvider = global.SixCRM.routes.include('controllers', 'providers/lambda-provider.js');
			const lambdaprovider = new LambdaProvider();

			lambdaprovider.lambda = {
				getPolicy: function(params, callback) {
					expect(params.FunctionName).to.equal(parameters.FunctionName);
					expect(params.Qualifier).to.equal(parameters.Qualifier);
					callback(new Error('fail'), null);
				}
			};

			return lambdaprovider.getPolicy(parameters).catch((error) => {
				expect(error.message).to.equal('fail');
			});
		});
	});

	describe('buildAddPermissionParameters', () => {

		it('successfully builds add permission parameters', () => {

			let parameters = {
				Action: 'an_action',
				FunctionName: 'a_function_name',
				Principal: 'a_principal',
				StatementId: 'a_statement_id'
			};

			const LambdaProvider = global.SixCRM.routes.include('controllers', 'providers/lambda-provider.js');
			const lambdaprovider = new LambdaProvider();

			let result = lambdaprovider.buildAddPermissionParameters(parameters);

			expect(result.Action).to.equal(parameters.Action);
			expect(result.FunctionName).to.equal(parameters.FunctionName);
			expect(result.Principal).to.equal(parameters.Principal);
			expect(result.StatementId).to.equal(parameters.StatementId);
		});
	});

	xdescribe('getLambdaInstance', () => {

		it('successfully retrieves lambda instance', () => {

			let lambda = 'deliveredtoarchive';

			const LambdaProvider = global.SixCRM.routes.include('controllers', 'providers/lambda-provider.js');
			const lambdaprovider = new LambdaProvider();

			let path = global.SixCRM.routes.path('handlers', 'handlers');

			mockery.registerMock(path, {
				workers: {
					forwardMessage: {
						deliveredtoarchive: (payload, context, callback) => {
							expect(payload).to.be.defined;
							expect(context).to.be.defined;
							expect(callback).to.be.defined;

							return callback(null, {body: {success: true}});
						}
					}
				}
			});

			let response = lambdaprovider.getLambdaInstance(lambda);

			expect(response).to.be.a('function');
		});

		it('throws error when lambda name does not exist', () => {

			let lambda = 'non_existing_name';

			const LambdaProvider = global.SixCRM.routes.include('controllers', 'providers/lambda-provider.js');
			const lambdaprovider = new LambdaProvider();

			try {
				lambdaprovider.getLambdaInstance(lambda);
			} catch (error) {
				expect(error).to.exist;
			}
		});
	});

	describe('invokeLocal', () => {

		xit('successfully executes lambda locally', (done) => {

			const LambdaProvider = global.SixCRM.routes.include('controllers', 'providers/lambda-provider.js');
			const lambdaprovider = new LambdaProvider();

			let parameters = {
				FunctionName: 'deliveredtoarchive',
				Payload: '{}'
			};

			let callback = (error, data) => {
				expect(data.StatusCode).to.equal(200);
				done();
			};

			let path = global.SixCRM.routes.path('handlers', 'workers/forwardmessage/handlers');

			mockery.registerMock(path, {
				deliveredtoarchive: (payload, context, callback) => {
					expect(payload).to.be.defined;
					expect(context).to.be.defined;
					expect(callback).to.be.defined;

					return callback(null, {body: {success: true}});
				}
			});


			lambdaprovider.invokeLocal(parameters, callback);

		});

		it('throws error from lambda callback', (done) => {

			const LambdaProvider = global.SixCRM.routes.include('controllers', 'providers/lambda-provider.js');
			const lambdaprovider = new LambdaProvider();

			let parameters = {
				FunctionName: 'deliveredtoarchive',
				Payload: '{}'
			};

			let callback = (error) => {
				expect(error.StatusCode).to.equal(500);
				done();
			};

			let path = global.SixCRM.routes.path('handlers', 'workers/forwardmessage/handlers');

			mockery.registerMock(path, {
				deliveredtoarchive: (payload, context, callback) => {
					expect(payload).to.be.defined;
					expect(context).to.be.defined;
					expect(callback).to.be.defined;

					return callback({StatusCode: 500}, null);
				}
			});


			lambdaprovider.invokeLocal(parameters, callback).catch(e => {
				expect(e).to.be.defined
			});

		});

		it('throws error when lambda was not successfully executed locally', (done) => {

			const LambdaProvider = global.SixCRM.routes.include('controllers', 'providers/lambda-provider.js');
			const lambdaprovider = new LambdaProvider();

			let parameters = {
				FunctionName: 'deliveredtoarchive',
				Payload: '{}'
			};

			let callback = () => {
				done();
			};

			let path = global.SixCRM.routes.path('handlers', 'workers/forwardmessage/handlers');

			mockery.registerMock(path, {
				deliveredtoarchive: (payload, context, callback) => {
					expect(payload).to.be.defined;
					expect(context).to.be.defined;
					expect(callback).to.be.defined;

					return callback(null, {body: {success: false}});
				}
			});


			lambdaprovider.invokeLocal(parameters, callback);

		});

	});

	describe('hasPermission', () => {

		it('successfully returns found policy', () => {

			let parameters = {
				FunctionName: 'a_function_name',
				SourceArn: 'a_source_arn'
			};

			let policy_result = {
				Policy: '{ "Statement": [{' +
                '"Condition": {' +
                    '"ArnLike": {' +
                        '"AWS:SourceArn": "a_source_arn"' +
                    '}' +
                '}}]}'
			};

			const LambdaProvider = global.SixCRM.routes.include('controllers', 'providers/lambda-provider.js');
			const lambdaprovider = new LambdaProvider();

			lambdaprovider.lambda = {
				getPolicy: function(params, callback) {
					expect(params.FunctionName).to.equal(parameters.FunctionName);
					expect(params.Qualifier).to.equal(parameters.Qualifier);
					callback(null, policy_result);
				}
			};

			return lambdaprovider.hasPermission(parameters).then((result) => {
				expect(result).to.deep.equal({
					Condition: {
						ArnLike: {
							"AWS:SourceArn": "a_source_arn"
						}
					}
				});
			});
		});

		it('returns false when specified and "AWS:SourceArn" from response do not match', () => {

			let parameters = {
				FunctionName: 'a_function_name',
				SourceArn: 'a_source_arn'
			};

			let policy_result = {
				Policy: '{ "Statement": [{' +
                '"Condition": {' +
                    '"ArnLike": {' +
                        '"AWS:SourceArn": "any_other_source_arn"' +
                    '}' +
                '}}]}'
			};

			const LambdaProvider = global.SixCRM.routes.include('controllers', 'providers/lambda-provider.js');
			const lambdaprovider = new LambdaProvider();

			lambdaprovider.lambda = {
				getPolicy: function(params, callback) {
					expect(params.FunctionName).to.equal(parameters.FunctionName);
					expect(params.Qualifier).to.equal(parameters.Qualifier);
					callback(null, policy_result);
				}
			};

			return lambdaprovider.hasPermission(parameters).then((result) => {
				expect(result).to.equal(false);
			});
		});

		it('returns false when parsing fails', () => {

			let parameters = {
				FunctionName: 'a_function_name',
				SourceArn: 'a_source_arn'
			};

			let policy_result = {
				Policy: '["not_valid_json" : 123]'
			};

			const LambdaProvider = global.SixCRM.routes.include('controllers', 'providers/lambda-provider.js');
			const lambdaprovider = new LambdaProvider();

			lambdaprovider.lambda = {
				getPolicy: function(params, callback) {
					expect(params.FunctionName).to.equal(parameters.FunctionName);
					expect(params.Qualifier).to.equal(parameters.Qualifier);
					callback(null, policy_result);
				}
			};

			return lambdaprovider.hasPermission(parameters).then((result) => {
				expect(result).to.equal(false);
			});
		});
	});

	describe('putPermission', () => {

		it('returns result when lambda already has permission', () => {

			let parameters = {
				Action: 'an_action',
				FunctionName: 'a_function_name',
				Principal: 'a_principal',
				StatementId: 'a_statement_id',
				SourceArn: 'a_source_arn'
			};

			let policy_result = {
				Policy: '{ "Statement": [{' +
                '"Condition": {' +
                '"ArnLike": {' +
                '"AWS:SourceArn": "a_source_arn"' +
                '}' +
                '},' +
                '"Sid":' +
                '"any_sid"' +
                '}]}'
			};

			const LambdaProvider = global.SixCRM.routes.include('controllers', 'providers/lambda-provider.js');
			const lambdaprovider = new LambdaProvider();

			lambdaprovider.lambda = {
				getPolicy: function(params, callback) {
					expect(params.FunctionName).to.equal(parameters.FunctionName);
					expect(params.Qualifier).to.equal(parameters.Qualifier);
					callback(null, policy_result);
				}
			};

			return lambdaprovider.putPermission(parameters).then((result) => {
				expect(result).to.deep.equal({
					Condition: {
						ArnLike: {
							"AWS:SourceArn": "a_source_arn"
						}
					},
					Sid: "any_sid"
				});
			});
		});

		it('adds permission if permission did not previously exist', () => {

			let parameters = {
				Action: 'an_action',
				FunctionName: 'a_function_name',
				Principal: 'a_principal',
				StatementId: 'a_statement_id',
				SourceArn: 'a_source_arn'
			};

			let policy_result = {
				Policy: '{ "Statement": [{' +
                '"Condition": {' +
                '"ArnLike": {' +
                '"AWS:SourceArn": "a_source_arn"' +
                '}' +
                '}}]}'
			};

			const LambdaProvider = global.SixCRM.routes.include('controllers', 'providers/lambda-provider.js');
			const lambdaprovider = new LambdaProvider();

			lambdaprovider.lambda = {
				getPolicy: function(params, callback) {
					expect(params.FunctionName).to.equal(parameters.FunctionName);
					expect(params.Qualifier).to.equal(parameters.Qualifier);
					callback(null, policy_result);
				},
				addPermission: function(params, callback) {
					expect(params.Action).to.equal(parameters.Action);
					expect(params.FunctionName).to.equal(parameters.FunctionName);
					expect(params.Principal).to.equal(parameters.Principal);
					expect(params.StatementId).to.equal(parameters.StatementId);
					callback(null, 'any_permission_data');
				}
			};

			return lambdaprovider.putPermission(parameters).then((result) => {
				expect(result).to.equal('any_permission_data');
			});
		});
	});
});

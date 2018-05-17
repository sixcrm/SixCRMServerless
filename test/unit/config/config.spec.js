const chai = require('chai');
const expect = chai.expect;
const ajv = global.SixCRM.routes.include('controllers', 'providers/ajv-provider.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

ajv.addSchema(require(global.SixCRM.routes.path('test', 'unit/config/serverless.json')));

describe('config', () => {

	let stage = global.SixCRM.configuration.stage;

	afterEach(() => {
		global.SixCRM.configuration.handleStage(stage);
	});

	describe('serverless', () => {

		it('should be valid', () => {

			let serverless_file = global.SixCRM.configuration.serverless_config;

			mvu.validateModel(serverless_file, global.SixCRM.routes.path('test', 'unit/config/serverless.json'))
		});

		it('names of lambda handlers should be correct', () => {

			let serverless_file = global.SixCRM.configuration.serverless_config;

			// Name of the handler must match name of the function, for example:
			//     billtohold:
			//         handler: handlers/workers/forwardmessage/billtohold/handler.billtohold
			// In the above example 'billtohold' must be spelled the same in both lines.
			for (let lambda_name in serverless_file.functions) {
				expect(lambda_name).to.equal(serverless_file.functions[lambda_name].handler.match(/\.[^/.]+$/)[0].replace('.',''));
			}

		});

	});

	describe('site config', () => {

		it('validates all site configs', () => {

			let stages = [];

			for (let stage in global.SixCRM.configuration.stages) {
				stages.push(global.SixCRM.configuration.stages[stage]);
			}

			arrayutilities.map(stages, (stage) => {
				it('should be valid for ' + stage, () => {

					global.SixCRM.configuration.stage = stage;
					let site_config = global.SixCRM.configuration.getSiteConfig();

					mvu.validateModel(site_config, global.SixCRM.routes.path('test', 'unit/config/site_config.json'));

				});
			});

		});


	});

});

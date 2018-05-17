const chai = require('chai');
const expect = chai.expect;
const fs = require('fs');
const glob = require('glob');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const ajv = global.SixCRM.routes.include('controllers', 'providers/ajv-provider.js');

const schemaWithNoReferences = `${__dirname}/model/sql_pagination.json`;
const schemaWithReferences = `${__dirname}/model/sixcrmidentifier.json`;
const schemaWithNestedReferences = `${__dirname}/model/entity.json`;

glob.sync(`${__dirname}/model/*.json`).map(file => ajv.addSchema(require(file)));

describe('lib/model-validator-utilities', () => {

	describe('validateModel', () => {
		it('validates valid model without references', () => {
			const validModel = {
				count: 0, order: 'asc', limit: 0, offset: 0
			};

			expect(mvu.validateModel(validModel, schemaWithNoReferences)).to.be.true;
		});

		it('validates invalid model without references', () => {

			const invalidModel = {
				count: 0
			};

			try {
				mvu.validateModel(invalidModel, schemaWithNoReferences);
			} catch (e) {
				expect(e.message).to.have.string('[500] One or more validation errors occurred:');
			}
		});

		it('validates valid model with flat references', () => {

			const validModel = 'e5b86f43-54cc-4547-bde2-956fee266021';

			expect(mvu.validateModel(validModel, schemaWithReferences)).to.be.true;
		});

		it('validates invalid model with flat references', () => {

			const invalidModel = 'e5b86f43-54cc-4547-bde2-956fee266021-12345-abc';

			try {
				mvu.validateModel(invalidModel, schemaWithNoReferences);
			} catch (e) {
				expect(e.message).to.have.string('[500] One or more validation errors occurred:');
			}
		});

		it('validates valid model with nested references', () => {

			const validModel = {
				id: 'e5b86f43-54cc-4547-bde2-956fee266021',
				created_at: '2017-04-06T18:40:41.405Z',
				updated_at: '2017-04-06T18:40:41.405Z'
			};

			expect(mvu.validateModel(validModel, schemaWithNestedReferences)).to.be.true;
		});

		it('validates invalid model with nested references', () => {

			const invalidModel = {
				id: 'invalid',
				created_at: '2017-04-06T18:40:41.405Zinvalid',
				updated_at: '2017-04-06T18:40:41.405Z'
			};

			try {
				mvu.validateModel(invalidModel, schemaWithNoReferences);
			} catch (e) {
				expect(e.message).to.have.string('[500] One or more validation errors occurred:');
			}
		});

		it('validates valid model against schema with `anyOf`', () => {

			const valid_model_1 = '581e5fff-c2ad-49e4-8a7e-344525cd3a37';
			const valid_model_2 = '2017-04-06T18:40:41.405Z';

			const schema = `${__dirname}/model/transactioninput.json`;

			expect(mvu.validateModel(valid_model_1, schema)).to.be.true;
			expect(mvu.validateModel(valid_model_2, schema)).to.be.true;
		});

	});

	describe('entity-utils', () => {

		const entityUtilitiesController = global.SixCRM.routes.include('controllers','entities/EntityUtilities');
		const euc = new entityUtilitiesController();

		const customer = { id: 'b5803b28-c584-4bb3-8fac-3315b91686b4',
			firstname: 'Test_b5803b28-c584-4bb3-8fac-3315b91686b3',
			lastname: 'Test',
			email: 'test@test.com',
			phone: '1234567890',
			address:
                { line1: '123 Test St.',
                	line2: 'Apartment 3',
                	city: 'Portland',
                	state: 'OR',
                	zip: '97213',
                	country: 'USA' },
			creditcards: [ 'df84f7bb-06bd-4daa-b1a3-6a2c113edd72' ],
			account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
			created_at: '2017-12-12T19:13:00.020Z',
			updated_at: '2017-12-12T19:13:00.020Z' };

		it('loads references recursively', (done) => {
			try {
				euc.validate(customer, global.SixCRM.routes.path('model', 'entities/customer.json'));
				done('Validation should have failed.')
			} catch (error) {
				expect(error.message).to.have.string('[500] One or more validation errors occurred:');
				done();
			}
		});
	});

	describe('customer', () => {
		const customer = {
			id:"24f7c851-29d4-4af9-87c5-0298fa74c689",
			account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
			email:"rama@damunaste.org",
			firstname:"Rama",
			lastname:"Damunaste",
			phone:"1234567890",
			address:{
				line1:"10 Downing St.",
				city:"London",
				state:"Oregon",
				zip:"97213",
				country:"US"
			},
			creditcards:["df84f7bb-06bd-4daa-b1a3-6a2c113edd72"],
			created_at:"2017-04-06T18:40:41.405Z",
			updated_at:"2017-04-06T18:41:12.521Z"
		};

		it('loads references recursively', (done) => {
			try {
				mvu.validateModel(customer, global.SixCRM.routes.path('model', 'entities/customer.json'));
				done('Validation should have failed.')
			} catch (error) {
				expect(error.message).to.have.string('[500] One or more validation errors occurred:');
				done();
			}
		});
	});

	describe('entities', () => {

		function validateSchemasOnPath(path) {
			fs.readdirSync(path)
				.filter((file_name) => file_name.endsWith('.json'))
				.forEach((file_name) => {
					const schema = path + '/' + file_name;
					const model_name = schema.replace(global.SixCRM.routes.path('model'), '');

					it('validates invalid ' + model_name, () => {
						const invalid_model = {};

						du.debug('Model:', invalid_model);
						du.debug('Schema:', schema);

						//du.info(invalid_model);
						try {
							mvu.validateModel(invalid_model, schema);
						} catch (e) {
							expect(e.message).to.have.string('[500] One or more validation errors occurred:');
						}
					});

				});
		}
		validateSchemasOnPath(global.SixCRM.routes.path('model', 'entities'));
		//validateSchemasOnPath(global.SixCRM.routes.path('model', 'actions'));
		validateSchemasOnPath(global.SixCRM.routes.path('model', 'jwt'));
		validateSchemasOnPath(global.SixCRM.routes.path('model', 'transaction'));

	});

});

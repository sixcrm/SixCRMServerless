let mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
let du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
let modelgenerator = require('../../model-generator.js');
let chai = require('chai');
let fs = require('fs');
let expect = chai.expect;

let schemaWithNoReferences = `${__dirname}/model/sql_pagination.json`;
let schemaWithReferences = `${__dirname}/model/sixcrmidentifier.json`;
let schemaWithNestedReferences = `${__dirname}/model/entity.json`;

describe('lib/model-validator-utilities', () => {

    describe('validateModel', () => {
        it('validates valid model without references', () => {

            let validModel = {
                count: 0, order: 'asc', limit: 0, offset: 0
            };

            expect(mvu.validateModel(validModel, schemaWithNoReferences)).to.be.true;
        });

        it('validates invalid model without references', () => {

            let invalidModel = {
                count: 0
            };

            try {
                mvu.validateModel(invalidModel, schemaWithNoReferences);
            } catch (e) {
                expect(e.message).to.equal('[500] One or more validation errors occurred.');
            }
        });

        it('validates valid model with flat references', () => {

            let validModel = 'e5b86f43-54cc-4547-bde2-956fee266021';

            expect(mvu.validateModel(validModel, schemaWithReferences)).to.be.true;
        });

        it('validates invalid model with flat references', () => {

            let invalidModel = 'e5b86f43-54cc-4547-bde2-956fee266021-12345-abc';

            try {
                mvu.validateModel(invalidModel, schemaWithNoReferences);
            } catch (e) {
                expect(e.message).to.equal('[500] One or more validation errors occurred.');
            }
        });

        it('validates valid model with nested references', () => {

            let validModel = {
                id: 'e5b86f43-54cc-4547-bde2-956fee266021',
                created_at: '2017-04-06T18:40:41.405Z',
                updated_at: '2017-04-06T18:40:41.405Z'
            };

            expect(mvu.validateModel(validModel, schemaWithNestedReferences)).to.be.true;
        });

        it('validates invalid model with nested references', () => {

            let invalidModel = {
                id: 'invalid',
                created_at: '2017-04-06T18:40:41.405Zinvalid',
                updated_at: '2017-04-06T18:40:41.405Z'
            };

            try {
                mvu.validateModel(invalidModel, schemaWithNoReferences);
            } catch (e) {
                expect(e.message).to.equal('[500] One or more validation errors occurred.');
            }
        });

        it('validates valid model against schema with `anyOf`', () => {

            let valid_model_1 = '581e5fff-c2ad-49e4-8a7e-344525cd3a37';
            let valid_model_2 = {
                id: 'fd8ec126-4b06-404f-933b-e2a257eba8e0',
                alias: 'TNIRRZ7JJL',
                account: '*',
                rebill: '2FA1f1d6-9Be9-4A74-8EA0-aBd39dE4433E',
                products:
                    [ { product: '5956be48-5f60-41E5-9dDa-b029eEB966b5',
                        amount: 70663065.66088085 },
                        { product: '6D3A5Fd2-FF46-47ba-96E2-8A164adEA3Ce',
                            amount: '$$$020.76' } ],
                processor_response: 'cillum',
                merchant_provider: 'caCC662b-e04D-4a2e-A1c1-3A6E1c13a0AB',
                created_at: '4606-25-20T24:47:69S5',
                updated_at: '1609-10-77T77:38:50-83:57',
                type: 'reverse',
                amount: 9.99 };

            let schema = global.SixCRM.routes.path('model', 'functional/register/debug-transactioninput.json');

            expect(mvu.validateModel(valid_model_1, schema)).to.be.true;
            expect(mvu.validateModel(valid_model_2, schema)).to.be.true;
        });

    });

    describe('entities', () => {

        function validateSchemasOnPath(path) {
            fs.readdirSync(path)
                .filter((file_name) => file_name.indexOf('.json') > -1)
                .forEach((file_name) => {
                    let schema = path + '/' + file_name;
                    let model_name = schema.replace(global.SixCRM.routes.path('model'), '');

                    xit('validates valid ' + model_name, () => {

                        return modelgenerator.random(model_name).then((valid_model) => {
                            du.debug('Model:', valid_model);
                            du.debug('Schema:', schema);
                            return expect(mvu.validateModel(valid_model, schema)).to.be.true;
                        });

                    });

                    it('validates invalid ' + model_name, () => {
                        let invalid_model = {};

                        du.debug('Model:', invalid_model);
                        du.debug('Schema:', schema);

                        try {
                            mvu.validateModel(invalid_model, schema);
                        } catch (e) {
                            expect(e.message).to.equal('[500] One or more validation errors occurred.');
                        }
                    });

                });
        }
        validateSchemasOnPath(global.SixCRM.routes.path('model', 'entities'));
        validateSchemasOnPath(global.SixCRM.routes.path('model', 'actions'));
        validateSchemasOnPath(global.SixCRM.routes.path('model', 'jwt'));
        validateSchemasOnPath(global.SixCRM.routes.path('model', 'transaction'));

    });

});

let mvu = global.routes.include('lib', 'model-validator-utilities.js');
let chai = require('chai');
let expect = chai.expect;

let schemaWithNoReferences = `${__dirname}/model/sql_pagination.json`;
let schemaWithReferences = `${__dirname}/model/sixcrmidentifier.json`;
let schemaWithNestedReferences = `${__dirname}/model/entity.json`;

describe('lib/permission-utilities', () => {

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

    });

});

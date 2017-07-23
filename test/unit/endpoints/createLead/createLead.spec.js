var fs = require('fs');
var path = require('path');
var createLead = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');
var chai = require('chai');
var expect = chai.expect;
var du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

chai.use(require('../../chaiAssertionHelper'));

describe('endpoints/createLead', function () {
    describe('validateInputs', function () {
        it('should not be valid with null input', function () {

            var actual = createLead.validateInput({});

            return actual.catch((err) => {
                return expect(err.message).to.equal('[500] Validation function is not a function.');
            });

        });

        xit('should not be valid with empty object input', function () {
            var actual = createLead.validateInput({}, createLead.validateEventSchema);

            return actual.catch((err) => {
                let error = JSON.parse(JSON.stringify(err));

                //return expect(err).to.deepEqualProcessor(__dirname, 'validateInput.empty');
                let emptyInputError = require(__dirname+'/'+'validateInput.empty.expected.json');


                //du.info(error, emptyInputError); process.exit();

                return expect(error).to.deep.include(emptyInputError);

            })
        });

        xit('should not be valid when provided a bad email address', function () {
            var actual = createLead.validateInput(require('./fixtures/invalidEmail'), createLead.validateEventSchema);

            return actual.catch((err) => {
                return expect(err).to.deepEqualProcessor(__dirname, 'validateInput.badEmail');
            })
        });
        xit('should throw err when not given a campaign_id', function () {
            var actual = createLead.validateInput(require('./fixtures/noCampaign.json'), createLead.validateEventSchema);

            return actual.catch((err) => {
                return expect(err).to.deepEqualProcessor(__dirname, 'validateInput.noCampaign');
            })
        });
        it('should pass validations and be returned unchanged', function () {
            var actual = createLead.validateInput(require('./fixtures/validLead'), createLead.validateEventSchema);

            return expect(actual).to.deepEqualProcessor(__dirname, 'validateInput.valid');
        });
    });
});

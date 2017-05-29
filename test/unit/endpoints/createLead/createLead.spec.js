var fs = require('fs');
var path = require('path');
var createLead = global.routes.include('controllers', 'endpoints/createLead.js');
var chai = require('chai');
var expect = chai.expect;

chai.use(require('../../chaiAssertionHelper'));

describe('endpoints/createLead', function () {
    describe('validateInputs', function () {
        it('should not be valid with null input', function () {

            var actual = createLead.validateInput({});

            return actual.catch((err) => {
                return expect(err.message).to.equal('Validation function is not a function.');
            });

        });

        it('should not be valid with empty object input', function () {
            var actual = createLead.validateInput({}, createLead.validateEventSchema);

            return actual.catch((err) => {
                return expect(err).to.deepEqualProcessor(__dirname, 'validateInput.empty');
            })
        });

        it('should not be valid when provided a bad email address', function () {
            var actual = createLead.validateInput(require('./fixtures/invalidEmail'), createLead.validateEventSchema);

            return actual.catch((err) => {
                return expect(err).to.deepEqualProcessor(__dirname, 'validateInput.badEmail');
            })
        });
        it('should throw err when not given a campaign_id', function () {
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

var fs = require('fs');
var path = require('path');
var createOrder = global.routes.include('controllers', 'endpoints/createOrder.js');
var chai = require('chai');
var expect = chai.expect;

chai.use(require('../../chaiAssertionHelper'));

describe('endpoints/createOrder', function () {
    describe('validateInputs', function () {
        it('should not be valid with null input', function () {
            var actual = createOrder.validateInput();

            return actual.then(res => expect(false).to.be.true).catch((err) => {
                return expect(err).to.deepEqualProcessor(__dirname, 'validateInput.empty');
            })
        });
        it('should not be valid with empty string input', function () {
            var actual = createOrder.validateInput('');

            return actual.catch((err) => {
                return expect(err).to.deepEqualProcessor(__dirname, 'validateInput.empty');
            })
        });
        it('should not be valid with empty object input', function () {
            var actual = createOrder.validateInput({});

            return actual.catch((err) => {
                return expect(err).to.deepEqualProcessor(__dirname, 'validateInput.empty');
            })
        });
        it('should pass validations and be returned unchanged', function () {
            var actual = createOrder.validateInput(require('./fixtures/validOrder'));

            return expect(actual).to.deepEqualProcessor(__dirname, 'validateInput.valid');
        });
    });
});

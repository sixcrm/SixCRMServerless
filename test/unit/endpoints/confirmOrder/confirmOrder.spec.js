var fs = require('fs');
var path = require('path');
var confirmOrder = require('../../../../controllers/endpoints/confirmOrder');
var chai = require('chai');
var chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);
var expect = chai.expect;
var assert = chai.assert;

chai.should();
require('../../../bootstrap.test')

var util = require('util');

chai.use(require('../../chaiAssertionHelper'));
//==========================================================================
// This will fail after the first test because the session will be modifed and
// set as complete.
//==========================================================================
xdescribe('endpoints/confirmOrder', function () {
    describe('validateInputs', function () {
        it('should NOT be valid with no arguments', function () {
            return assert.isRejected(confirmOrder.validateInput(), Error, 'The session_id must be set in the querystring.');
        });
        it('should pass validation', function () {
            var actual = confirmOrder.validateInput(require('./fixtures/validSession'));

            return assert.isFulfilled(actual);
        });
		// As per comment above, this unit test can only pass the *first* time
		// it is run against a freshly populated local database. As such, it
		// makes a lousy unit test
		//
		// it('should pass call to confirmOrder', function () {
		// 	var actual = confirmOrder.confirmOrder(require('./fixtures/validSession'));
		// 	return assert.isFulfilled(actual);
		// });
    });
});

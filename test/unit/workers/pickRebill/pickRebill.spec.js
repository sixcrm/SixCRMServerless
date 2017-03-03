var fs = require('fs');
var util = require('util');
var path = require('path');
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var expect = chai.expect;
var assert = chai.assert;
chai.should();
require('../../../bootstrap.test')

// disabled for now:
// UnhandledPromiseRejectionWarning: Unhandled promise rejection (rejection id: 10): TypeError: this.dynamodb.scan is not a function
// Error: Timeout of 30000ms exceeded. For async tests and hooks, ensure "done()" is called; if returning a Promise, ensure it resolves.

// describe('workers/pickRebill', function () {
// 	describe('pickRebill', function (done) {
// 		it('will be true (need to determine the correct response)', function() {
// 			var pickRebill = require('../../../../controllers/workers/pickRebill');
// 			var actual = pickRebill.pickRebill();
//            //TODO: determine correct response:
// 			return Promise.resolve(actual).should.eventually.equal(true)
// 		})
// 	});
// });

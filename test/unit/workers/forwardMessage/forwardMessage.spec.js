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

// console.log("STARTING forwardMessage test=====================");
describe('workers/forwardMessage', function () {
	describe('forwardMessage', function (done) {
		it('will be NOTIFIED', function() {
			var forwardMessage = require('../../../../controllers/workers/forwardMessage');
			var actual = forwardMessage.forwardMessage();
			return Promise.resolve(actual).should.eventually.equal("NOTIFIED")
		})
	});
});

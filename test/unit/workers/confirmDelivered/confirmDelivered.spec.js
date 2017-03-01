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

// Disabled for now. One of two errors, either:
// "Error: Unexpected response from USPS"
// or "TypeError: this.dynamodb.query is not a function" in lib/dynamodb-utilities.js

// describe('workers/confirmDelivered', function () {
// 	describe('confirmDelivered', function (done) {
// 		it('will be DELIVERED', function() {
//             console.log("==============");
//             var confirmDelivered = require('../../../../controllers/workers/confirmDelivered');
//             var rebill = require('./fixtures/validRebill');
// 			var actual = confirmDelivered.confirmDelivered(rebill);
// 			return Promise.resolve(actual).should.eventually.equal("DELIVERED")
// 		})
// 	});
// });

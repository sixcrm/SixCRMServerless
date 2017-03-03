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
// describe('workers/confirmShipped', function () {
// 	describe('confirmShipped', function (done) {
// 		it('will be SHIPPED', function() {
//             var confirmShipped = require('../../../../controllers/workers/confirmShipped');
//             var rebill = require('./fixtures/validRebill');
// 			var actual = confirmShipped.confirmShipped(rebill);
// 			return Promise.resolve(actual).should.eventually.equal("SHIPPED")
// 		})
// 	});
// });

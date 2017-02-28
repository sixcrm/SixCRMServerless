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

// Disabled for now, due to: Error: Unexpected response from USPS
// describe('workers/confirmDelivered', function () {
// 	describe('confirmDelivered', function (done) {
// 		it('will be DELIVERED', function() {
//             var confirmDelivered = require('../../../../controllers/workers/confirmDelivered');
//             var rebill = require('./fixtures/validRebill');
// 			var actual = confirmDelivered.confirmDelivered(rebill);
// 			return Promise.resolve(actual).should.eventually.equal("DELIVERED")
// 		})
// 	});
// });

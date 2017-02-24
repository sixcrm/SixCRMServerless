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

// What we really need is to chain workers on a particular rebill to test
// shipping and confirmed shipped.
describe('workers/confirmShipped', function () {
	describe('confirmShipped', function (done) {
		it('will be SHIPPED', function() {
            var confirmShipped = require('../../../../controllers/workers/confirmShipped');
			var shipProduct = require('../../../../controllers/workers/shipProduct');
            var ship = shipProduct.shipProducts(require('./fixtures/validRebill'));
			var actual = confirmShipped.confirmShipped(require('./fixtures/validRebill'));
			return Promise.resolve(actual).should.eventually.equal("SHIPPED")
		})
	});
});

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

// console.log("STARTING shipProduct test=====================");
// describe('workers/shipProduct', function () {
// 	describe('shipProduct', function (done) {
// 		it('will be NOTIFIED', function() {
// 			var shipProduct = require('../../../../controllers/workers/shipProduct');
// 			var actual = shipProduct.shipProducts(require('./fixtures/validRebill'));
// 			return Promise.resolve(actual).should.eventually.equal("NOTIFIED")
// 		})
// 	});
// });

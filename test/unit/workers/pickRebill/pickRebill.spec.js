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

// describe('workers/pickRebill', function () {
// 	describe('pickRebill', function (done) {
// 		it('will be true', function() {
// 			var pickRebill = require('../../../../controllers/workers/pickRebill');
// 			var actual = pickRebill.pickRebill();
//             //TODO: determine correct response:
// 			return Promise.resolve(actual).should.eventually.equal(true)
// 		})
// 	});
// });

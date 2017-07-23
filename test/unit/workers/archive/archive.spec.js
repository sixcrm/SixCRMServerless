var fs = require('fs');
var util = require('util');
var path = require('path');
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);
var expect = chai.expect;
var assert = chai.assert;

chai.should();
require('../../../bootstrap.test');

describe('workers/archive', function () {
    describe('archive', function (done) {
        it('will be ARCHIVED', function() {
            var archive = global.SixCRM.routes.include('controllers', 'workers/archive.js');
            var rebill = require('./fixtures/validRebill');
            var actual = archive.archive(rebill);

            return Promise.resolve(actual).should.eventually.equal("ARCHIVED")
        })
    });
});

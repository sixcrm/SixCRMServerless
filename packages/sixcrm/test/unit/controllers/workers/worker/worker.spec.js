const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');

const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidMessage(id){

	return MockEntities.getValidMessage(id);

}

function getValidSession(id){

	return MockEntities.getValidSession(id);

}

function getValidRebill(id){

	return MockEntities.getValidRebill(id);

}

describe('controllers/workers/worker', function () {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	after(() => {
		mockery.disable();
	});

});

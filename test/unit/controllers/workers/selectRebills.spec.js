const _ = require('lodash');
const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');

const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

describe('controllers/workers/selectRebills.js', () => {
	describe('constructor', () => {
		it('successfully executes the constructor', () => {

			const SelectRebillsController = global.SixCRM.routes.include('controllers', 'workers/selectRebills.js');
			let selectRebillsController = new SelectRebillsController();

			expect(objectutilities.getClassName(selectRebillsController)).to.equal('SelectRebillsController');
		});
	});

});

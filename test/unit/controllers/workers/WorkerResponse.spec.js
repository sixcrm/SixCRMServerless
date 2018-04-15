
const _ = require('lodash');
const chai = require("chai");
const uuidV4 = require('uuid/v4');
const expect = chai.expect;
const mockery = require('mockery');

let WorkerResponseController = global.SixCRM.routes.include('controllers', 'workers/components/WorkerResponse.js');

describe('controllers/workers/components/WorkerResponse.js', () => {

	describe('constructor', () => {
		it('successfully executes the constructor', () => {
			let workerResponseController = new WorkerResponseController();

			expect(workerResponseController).to.have.property('merged_response_types');
			expect(workerResponseController.merged_response_types).to.have.property('noaction');
			expect(workerResponseController.merged_response_types['noaction']).to.deep.equal({code: 'noaction'});
		});
	});

	describe('setAdditionalInformation', () => {
		it('successfully sets additional information', () => {
			let workerResponseController = new WorkerResponseController();

			workerResponseController.setAdditionalInformation('hi there');
			expect(workerResponseController.additional_information).to.equal('hi there');
		});
	});

	describe('getAdditionalInformation', () => {
		it('successfully gets additional information', () => {
			let workerResponseController = new WorkerResponseController();

			workerResponseController.setAdditionalInformation('hi there');
			expect(workerResponseController.getAdditionalInformation()).to.equal('hi there');
		});
	});

});

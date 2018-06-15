
const _ = require('lodash');
const chai = require("chai");
const uuidV4 = require('uuid/v4');
const expect = chai.expect;
const mockery = require('mockery');
const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;

const timestamp = require('@sixcrm/sixcrmcore/util/timestamp').default;
const randomutilities = require('@sixcrm/sixcrmcore/util/random').default;
const objectutilities = require('@sixcrm/sixcrmcore/util/object-utilities').default;
const stringutilities = require('@sixcrm/sixcrmcore/util/string-utilities').default;
const arrayutilities = require('@sixcrm/sixcrmcore/util/array-utilities').default;
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');

const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidMessage(id){

	return MockEntities.getValidMessage(id);

}

let rebill_id = null

process.argv.forEach((val, index, array) => {
	if(stringutilities.isMatch(val, /^--rebill=[a-z0-9\-].*$/)){
		rebill_id = val.split('=')[1];
	}
});

describe('controllers/workers/processBilling', () => {

	describe('execute', () => {

		it('successfully executes', () => {

			rebill_id = (!_.isNull(rebill_id))?rebill_id:uuidV4();
			let message = getValidMessage(rebill_id);

			const ProcessBillingController = global.SixCRM.routes.include('controllers', 'workers/processBilling.js');
			let processBillingController = new ProcessBillingController();

			return processBillingController.execute(message).then(result => {
				expect(objectutilities.getClassName(result)).to.equal('WorkerResponse');
				du.info(result, result.getCode());
				expect(result.getCode()).to.equal('success');
			});

		});

	});

});

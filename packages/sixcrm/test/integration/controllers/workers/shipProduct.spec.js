
const _ = require('lodash');
const chai = require("chai");
const uuidV4 = require('uuid/v4');
const expect = chai.expect;
const mockery = require('mockery');
const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;

const timestamp = require('@6crm/sixcrmcore/lib/util/timestamp').default;
const randomutilities = require('@6crm/sixcrmcore/lib/util/random').default;
const objectutilities = require('@6crm/sixcrmcore/lib/util/object-utilities').default;
const stringutilities = require('@6crm/sixcrmcore/lib/util/string-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/lib/util/array-utilities').default;
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

describe('controllers/workers/shipProduct', () => {

	describe('execute', () => {

		it('successfully executes', () => {

			rebill_id = (!_.isNull(rebill_id))?rebill_id:uuidV4();
			let message = getValidMessage(rebill_id);

			const ShipProductController = global.SixCRM.routes.include('controllers', 'workers/shipProduct.js');
			let shipProductController = new ShipProductController();

			return shipProductController.execute(message).then(result => {
				expect(objectutilities.getClassName(result)).to.equal('WorkerResponse');
				du.info(result, result.getCode())
				expect(result.getCode()).to.equal('success');
			});

		});

	});

});

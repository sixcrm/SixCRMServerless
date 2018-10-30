

const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');
const uuidV4 = require('uuid/v4');
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;

function getValidSpoofedRebillMessage(){

	return {
		Body: JSON.stringify({id:uuidV4()}),
		spoofed:true
	}

}

function getValidRebill(){

	return {
		id: uuidV4(),
		bill_at: "2017-04-06T18:40:41.405Z",
		account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
		parentsession: uuidV4(),
		product_schedules: [uuidV4()],
		amount: 79.99,
		created_at:"2017-04-06T18:40:41.405Z",
		updated_at:"2017-04-06T18:41:12.521Z"
	};

}

xdescribe('controllers/workers/pickRebills.js', function () {

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

	describe('execute', function () {

		afterEach(() => {
			mockery.resetCache();
		});

		after(() => {
			mockery.deregisterAll();
		});

		describe('constructor', () => {

			it('successfully constructs',  () => {

				const PickRebillsController = global.SixCRM.routes.include('controllers', 'workers/pickRebills.js');
				let pickRebillsController = new PickRebillsController();

				expect(objectutilities.getClassName(pickRebillsController)).to.equal('PickRebillsController');

			});

		});

		describe('execute', () => {

			it('successfully executes when no rebills are available', () => {

				let rebill = getValidRebill();

				mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), class {
					get() {
						return Promise.resolve(rebill);
					}
				});

				let rebill_helper_mock = class {
					constructor(){

					}
					updateRebillProcessing(){
						return Promise.resolve(true);
					}
				}

				mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'), rebill_helper_mock);

				let message = getValidSpoofedRebillMessage();
				const PickRebills = global.SixCRM.routes.include('controllers', 'workers/pickRebills.js');
				let pickRebills = new PickRebills();

				return pickRebills.execute(message).then(result => {
					expect(objectutilities.getClassName(result)).to.equal('WorkerResponse');
					expect(result.getCode()).to.equal('success');
				});

			});

		});

	});

	describe('markRebillAsProcessing', () => {

		it('successfully marks a rebill as processing', () => {

			let rebill = getValidRebill();

			let rebill_helper_mock = class {
				constructor(){

				}
				updateRebillProcessing(){
					return Promise.resolve(true);
				}
			}

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'), rebill_helper_mock);

			const PickRebillsController = global.SixCRM.routes.include('controllers', 'workers/pickRebills.js');
			let pickRebillsController = new PickRebillsController();

			pickRebillsController.parameters.set('rebill', rebill);

			return pickRebillsController.markRebillAsProcessing().then(result => {
				expect(result).to.equal(true);
			});

		});

	});

});


const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');

const objectutilities = require('@sixcrm/sixcrmcore/util/object-utilities').default;

const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidMessage(id){

	return MockEntities.getValidMessage(id);

}

function getValidRebill(id){

	return MockEntities.getValidRebill(id);

}

function getValidTerminalResponse(){

	const TerminalResponse = global.SixCRM.routes.include('providers', 'terminal/Response.js');

	return new TerminalResponse({
		response_type: 'success',
		rebill: getValidRebill(),
		provider_response: getValidProviderResponse()
	});

}

function getValidProviderResponse(){
	return {
		response:{},
		code:'success',
		message:'Success'
	};
}

xdescribe('controllers/workers/shipProduct', function () {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	afterEach(() => {
		mockery.resetCache();
		mockery.deregisterAll();
	});

	describe('constructor', () => {

		it('successfully constructs', () => {

			const ShipProductController = global.SixCRM.routes.include('controllers', 'workers/shipProduct.js');
			let shipProductController = new ShipProductController();

			expect(objectutilities.getClassName(shipProductController)).to.equal('shipProductController');

		});

	});

	describe('ship', () => {

		it('successfully executes a rebill ship via shipping terminal', () => {

			let rebill = getValidRebill();
			let terminal_response = getValidTerminalResponse();

			let terminal_mock = class Terminal {
				constructor(){

				}
				fulfill(){
					return Promise.resolve(terminal_response);
				}
			}

			mockery.registerMock(global.SixCRM.routes.path('providers', 'terminal/Terminal.js'), terminal_mock);

			mockery.registerMock(global.SixCRM.routes.path('helpers','events/Event.js'), class {
				constructor(){}
				pushEvent(){
					return Promise.resolve({});
				}
			});

			const ShipProductController = global.SixCRM.routes.include('controllers', 'workers/shipProduct.js');
			let shipProductController = new ShipProductController();

			shipProductController.parameters.set('rebill', rebill);

			return shipProductController.ship().then(result => {

				expect(shipProductController.parameters.store['terminalresponse']).to.equal(terminal_response);
			});

		});

	});

	describe('respond', () => {

		it('successfully responds', () => {

			let terminal_response = getValidTerminalResponse();

			const ShipProductController = global.SixCRM.routes.include('controllers', 'workers/shipProduct.js');
			let shipProductController = new ShipProductController();

			shipProductController.parameters.set('terminalresponse', terminal_response);

			let response = shipProductController.respond();

			expect(objectutilities.getClassName(response)).to.equal('WorkerResponse');
			expect(response.getCode()).to.equal('success');

		});

	});

	describe('execute', () => {

		it('successfully executes', () => {

			let rebill = getValidRebill();
			let message = getValidMessage(rebill.id);
			let terminal_response = getValidTerminalResponse();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				get({id}) {
					if(id == rebill.id){
						return Promise.resolve(rebill);
					}
					return Promise.resolve(null);
				}
			});

			let terminal_mock = class Terminal {
				constructor(){

				}
				fulfill(){
					return Promise.resolve(terminal_response);
				}
			}

			mockery.registerMock(global.SixCRM.routes.path('providers', 'terminal/Terminal.js'), terminal_mock);

			mockery.registerMock(global.SixCRM.routes.path('helpers','events/Event.js'), class {
				constructor(){}
				pushEvent(){
					return Promise.resolve({});
				}
			});

			const ShipProductController = global.SixCRM.routes.include('controllers', 'workers/shipProduct.js');
			let shipProductController = new ShipProductController();

			return shipProductController.execute(message).then(result => {
				expect(objectutilities.getClassName(result)).to.equal('WorkerResponse');
				expect(shipProductController.parameters.store['terminalresponse']).to.equal(terminal_response);
				expect(result.getCode()).to.equal('success');
			});

		});

	});

});

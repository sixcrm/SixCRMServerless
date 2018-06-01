const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

const stepFunctionWorkerController = global.SixCRM.routes.include('controllers', 'workers/statemachine/components/stepFunctionWorker.js');

module.exports = class TriggerPostFulfillmentController extends stepFunctionWorkerController {

	constructor() {

		super();

	}

	async execute(event) {

		du.debug('Execute');

		this.validateEvent(event);

		let rebill = await this.getRebill(event.guid, true);

		let shipping_receipts = await this.getShippingReceipts(rebill);

		if(_.isArray(shipping_receipts) && arrayutilities.nonEmpty(shipping_receipts)){

			let trigger_promises = arrayutilities.map(shipping_receipts, shipping_receipt => {
				return this.triggerPostFulfillment(shipping_receipt);
			});

			let result = await Promise.all(trigger_promises);

			return result;

		}

		throw eu.getError('server', 'There are no shipping receipts associated with the rebill ID "'+rebill.id+'".');

	}

	async getShippingReceipts(rebill){

		du.debug('Get Shipping Receipts');

		if(!_.has(this, 'rebillHelperController')){
			const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			this.rebillHelperController = new RebillHelperController();
		}

		let shipping_receipts = await this.rebillHelperController.getShippingReceipts({rebill: rebill});

		return shipping_receipts;

	}

	triggerPostFulfillment(shipping_receipt){

		du.debug('Trigger Post Fulfillment');

		if(!_.has(shipping_receipt, 'id')){
			throw eu.getError('server', 'Expected Shipping Receipt to have property "id".');
		}

		if(!stringutilities.isUUID(shipping_receipt.id)){
			throw eu.getError('server', 'Expected Shipping Receipt ID to be a UUID.');
		}

		const parameters = {
			stateMachineName: 'Postfulfillment',
			input:JSON.stringify({guid: shipping_receipt.id})
		};

		if(!_.has(this, 'stateMachineHelperController')){
			const StateMachineHelperController = global.SixCRM.routes.include('helpers','statemachine/StateMachine.js');
			this.stateMachineHelperController = new StateMachineHelperController();
		}

		return this.stateMachineHelperController.startExecution(parameters);

	}

}

const _ = require('lodash');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const stringutilities = require('@6crm/sixcrmcore/util/string-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;

const StepFunctionTriggerController = global.SixCRM.routes.include('controllers', 'workers/statemachine/components/stepFunctionTrigger.js');

module.exports = class TriggerPostFulfillmentController extends StepFunctionTriggerController {

	constructor() {

		super();

		this.next_state = 'Postfulfillment';

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

		return super.execute({guid: shipping_receipt.id});

	}

}

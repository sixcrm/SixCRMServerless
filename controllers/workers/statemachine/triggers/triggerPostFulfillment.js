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
				return this.triggerPostFulfillment(shipping_receipt, rebill);
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

	async triggerPostFulfillment(shipping_receipt, rebill){

		du.debug('Trigger Post Fulfillment', shipping_receipt, rebill);

		if(!_.has(shipping_receipt, 'id')){
			throw eu.getError('server', 'Expected Shipping Receipt to have property "id".');
		}

		if(!stringutilities.isUUID(shipping_receipt.id)){
			throw eu.getError('server', 'Expected Shipping Receipt ID to be a UUID.');
		}

		const EventsHelperController = global.SixCRM.routes.include('helpers', 'events/Event.js');
		const SessionController = global.SixCRM.routes.include('entities','Session.js');
		const CustomerController = global.SixCRM.routes.include('entities','Customer.js');
		const CampaignController = global.SixCRM.routes.include('entities','Campaign.js');

		const eventHelperController = new EventsHelperController();
		const sessionController = new SessionController();
		const customerController = new CustomerController();
		const campaignController = new CampaignController();

		let session = await sessionController.get({id: rebill.parentsession});
		let customer = await customerController.get({id: session.customer});
		let campaign = await campaignController.get({id: session.campaign});

		let context = {
			shipping_receipt, rebill, session, customer, campaign
		};

		return eventHelperController.pushEvent({event_type: 'allfulfillments', context: context}).then(result => {
			du.info(result);

			return super.execute({guid: shipping_receipt.id});
		});

	}

}

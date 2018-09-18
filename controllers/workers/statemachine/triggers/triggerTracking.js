const du = require('@6crm/sixcrmcore/util/debug-utilities').default;

const StepFunctionTriggerController = global.SixCRM.routes.include('controllers', 'workers/statemachine/components/stepFunctionTrigger.js');

const EventsHelperController = global.SixCRM.routes.include('helpers', 'events/Event.js');
const SessionController = global.SixCRM.routes.include('entities','Session.js');
const CustomerController = global.SixCRM.routes.include('entities','Customer.js');
const CampaignController = global.SixCRM.routes.include('entities','Campaign.js');
const ShippingReceiptController = global.SixCRM.routes.include('entities','ShippingReceipt.js');
const RebillController = global.SixCRM.routes.include('entities','Rebill.js');

module.exports = class TriggerTrackingController extends StepFunctionTriggerController {

	constructor() {

		super();

		this.next_state = 'Tracking';

		this.eventHelperController = new EventsHelperController();
		this.sessionController = new SessionController();
		this.customerController = new CustomerController();
		this.campaignController = new CampaignController();
		this.shippingReceiptController = new ShippingReceiptController();
		this.rebillController = new RebillController();

	}

	async execute(event) {

		du.debug('TriggerTrackingController Execute', event);

		let shipping_receipt = await this.shippingReceiptController.get({id: event.guid});
		let rebill = await this.rebillController.get({id: shipping_receipt.rebill});
		let session = await this.sessionController.get({id: rebill.parentsession});
		let customer = await this.customerController.get({id: session.customer});
		let campaign = await this.campaignController.get({id: session.campaign});

		let context = {
			shipping_receipt, rebill, session, customer, campaign
		};

		await this.eventHelperController.pushEvent({event_type: this.getEventType(rebill), context: context});

		return super.execute(event);
	}

	getEventType(rebill) {
		du.debug('Get Event Type', rebill);

		let event_type = rebill.cycle ? 'allfulfillment' : 'initialfulfillment';

		du.debug(event_type);

		return event_type;
	}
}

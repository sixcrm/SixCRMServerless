const StepFunctionTriggerController = global.SixCRM.routes.include('controllers', 'workers/statemachine/components/stepFunctionTrigger.js');

const EventsHelperController = global.SixCRM.routes.include('helpers', 'events/Event.js');
const SessionController = global.SixCRM.routes.include('entities','Session.js');
const CustomerController = global.SixCRM.routes.include('entities','Customer.js');
const CampaignController = global.SixCRM.routes.include('entities','Campaign.js');
const ShippingReceiptController = global.SixCRM.routes.include('entities','ShippingReceipt.js');
const RebillController = global.SixCRM.routes.include('entities','Rebill.js');
const TransactionController = global.SixCRM.routes.include('entities','Transaction.js');
const CreditCardController = global.SixCRM.routes.include('entities','CreditCard.js');
const AnalyticsEvent = global.SixCRM.routes.include('helpers', 'analytics/analytics-event.js');

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
		this.transactionController = new TransactionController();
		this.creditCardController = new CreditCardController();

	}

	async execute(event) {

		let shipping_receipt = await this.shippingReceiptController.get({id: event.guid});
		let rebill = await this.rebillController.get({id: shipping_receipt.rebill});
		let session = await this.sessionController.get({id: rebill.parentsession});
		let customer = await this.customerController.get({id: session.customer});
		let campaign = await this.campaignController.get({id: session.campaign});
		let transactions = await this.transactionController.listTransactionsByRebillID({id: rebill.id});
		let creditcard = null;

		if (transactions && transactions.transactions && transactions.transactions.length) {
			creditcard = await this.creditCardController.get({id: transactions.transactions[0].creditcard})
		}

		let context = {
			shipping_receipt, rebill, session, customer, campaign, creditcard
		};

		if (!rebill.cycle) {
			await this.eventHelperController.pushEvent({event_type: 'initialfulfillment', context: context});
		}

		await this.eventHelperController.pushEvent({event_type: 'allfulfillments', context: context});

		await AnalyticsEvent.push('rebill', {
			id: rebill.id,
			status: 'shipped'
		});

		return super.execute(event);
	}

}

//const _ = require('lodash')

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;

const stepFunctionWorkerController = global.SixCRM.routes.include('controllers', 'workers/statemachine/components/stepFunctionWorker.js');
const RebillController = global.SixCRM.routes.include('entities','Rebill.js');
const SessionController = global.SixCRM.routes.include('entities','Session.js');
const CustomerController = global.SixCRM.routes.include('entities','Customer.js');
const CampaignController = global.SixCRM.routes.include('entities','Campaign.js');

module.exports = class SendDeliveryNotificationController extends stepFunctionWorkerController {

	constructor() {

		super();

		this.rebillController = new RebillController();
		this.sessionController = new SessionController();
		this.customerController = new CustomerController();
		this.campaignController = new CampaignController();

	}

	async execute(event) {

		du.debug('Execute');

		this.validateEvent(event);

		let shipping_receipt = await this.getShippingReceipt(event.guid);

		let context = {
			shipping_receipt: shipping_receipt
		};

		if (shipping_receipt.rebill) {
			let rebill = await this.rebillController.get({id: shipping_receipt.rebill});
			let session = await this.sessionController.get({id: rebill.parentsession});
			let customer = await this.customerController.get({id: session.customer});
			let campaign = await this.campaignController.get({id: session.campaign});

			context.rebill = rebill;
			context.session = session;
			context.customer = customer;
			context.campaign = campaign;
		}

		await this.pushEvent({
			event_type:'delivery',
			context
		});

		return true;

	}

}

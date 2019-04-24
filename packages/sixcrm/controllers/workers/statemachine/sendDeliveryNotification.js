const _ = require('lodash');
const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;

const stepFunctionWorkerController = global.SixCRM.routes.include('controllers', 'workers/statemachine/components/stepFunctionWorker.js');
const RebillController = require('../../entities/Rebill');
const TrialConfirmationHelper = require('../../../lib/controllers/helpers/entities/trialconfirmation/TrialConfirmation').default;

module.exports = class SendDeliveryNotificationController extends stepFunctionWorkerController {

	constructor() {

		super();

	}

	async execute(event) {

		this.validateEvent(event);

		const shipping_receipt = await this.getShippingReceipt(event.guid);

		await this.confirmSessionDelivery(shipping_receipt);

		return true;

	}

	async confirmSessionDelivery(shipping_receipt) {
		du.debug('Confirm Session Delivery for', shipping_receipt);

		if (_.has(shipping_receipt, 'rebill')) {

			const rebillController = new RebillController();
			const rebill = await rebillController.get({id: shipping_receipt.rebill});

			if (rebill) {
				const trialConfirmationHelper = new TrialConfirmationHelper();

				try {
					await trialConfirmationHelper.confirmTrialDelivery(rebill.parentsession);
				} catch (error) {
					du.info(`Ignoring trial confirmation, ${error.message}`);
				}

			}

		}

	}

};

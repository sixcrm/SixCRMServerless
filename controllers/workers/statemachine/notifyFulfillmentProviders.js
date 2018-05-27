const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');

const stepFunctionWorkerController = global.SixCRM.routes.include('controllers', 'workers/components/stepfunctionworker.js');

module.exports = class NotifyFulfillmentProvidersController extends stepFunctionWorkerController {

	constructor() {

		super();

	}

	async execute(event) {

		du.debug('Execute');

		this.validateEvent(event);

		let rebill = await this.getRebill(event.guid, true);

		let fulfillment_request_result = await this.triggerFulfillment(rebill);

		await this.triggerNotifications({rebill: rebill, fulfillment_request_result: fulfillment_request_result});

		return fulfillment_request_result.toUpperCase();

	}

	async triggerFulfillment(rebill){

		du.debug('Trigger Fulfillment');

		const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
		let terminalController = new TerminalController();

		let terminal_response = (await terminalController.fulfill({rebill: rebill}));

		let response_code = terminal_response.getCode();

		if(response_code == 'error'){
			throw eu.getError('server', 'Terminal Controller returned an error: '+JSON.stringify(terminal_response));
		}
		
		return response_code;

	}

	async triggerNotifications({rebill, fulfillment_request_result}){

		du.debug('Trigger Fulfillment Notifications');

		if(!_.has(rebill, 'id')){
			throw eu.getError('server', 'Expected rebill to have property "id".');
		}

		if(!_.isString(fulfillment_request_result) || !stringutilities.nonEmpty(fulfillment_request_result)){
			throw eu.getError('server', 'Expected fulfillment_request_result to be a non-empty string.');
		}

		return this.pushEvent({
			event_type: 'fulfillment_triggered_'+fulfillment_request_result,
			context:{
				rebill: rebill
			}
		});

	}

}

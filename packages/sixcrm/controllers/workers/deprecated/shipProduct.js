

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;

const workerController = global.SixCRM.routes.include('controllers', 'workers/components/worker.js');

module.exports = class shipProductController extends workerController {

	constructor() {

		super();

		this.parameter_definition = {
			execute: {
				required: {
					message: 'message'
				},
				optional: {}
			}
		};

		this.parameter_validation = {
			message: global.SixCRM.routes.path('model', 'workers/sqsmessage.json'),
			rebill: global.SixCRM.routes.path('model', 'entities/rebill.json'),
			terminalresponse: global.SixCRM.routes.path('model', 'workers/shipProduct/terminalresponse.json')
		};

		this.augmentParameters();

	}

	execute(message) {

		return this.preamble(message)
			.then(() => this.ship())
			.then(() => this.respond())
			.catch(error => {
				du.error(error);
				return super.respond('error', error.message);
			})

	}

	ship() {
		let rebill = this.parameters.get('rebill');

		const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
		let terminalController = new TerminalController();

		return terminalController.fulfill({
			rebill: rebill
		}).then(response => {

			let terminal_response_code = response.getCode();

			return this.pushEvent({
				event_type: 'fulfillment_triggered_' + terminal_response_code
			})
				.then(() => {

					this.parameters.set('terminalresponse', response);

					return;

				});

		});

	}

	respond() {
		let terminal_response = this.parameters.get('terminalresponse');

		return super.respond(terminal_response.getCode());

	}

}

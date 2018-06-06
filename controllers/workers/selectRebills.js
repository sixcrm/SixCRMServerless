const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const workerController = global.SixCRM.routes.include('controllers', 'workers/components/worker.js');

module.exports = class selectRebillsController extends workerController {

	constructor(){

		super();

		this.parameter_definition = {
			execute: {
				required: {
					message: 'message'
				},
				optional:{}
			}
		};

		this.parameter_validation = {
			message: global.SixCRM.routes.path('model', 'helpers/rebill/spoofedrebillmessage.json')
		};

		const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');

		this.rebillHelperController = new RebillHelperController();

		this.augmentParameters();

	}

	execute(message){

		du.debug('Execute');

		return this.preamble(message)
			.then(() => this.markRebillAsProcessing())
			.then(() => this.respond());

	}

	markRebillAsProcessing(){

		du.debug('Mark Rebills As Processing');

		let rebill = this.parameters.get('rebill');

		return this.rebillHelperController.updateRebillProcessing({rebill: rebill, processing: true}).then(() => {

			return true;

		});

	}

	respond(){

		du.debug('Respond');

		return super.respond('success');

	}

}

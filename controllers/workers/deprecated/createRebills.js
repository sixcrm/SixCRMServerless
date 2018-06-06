
const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const workerController = global.SixCRM.routes.include('controllers', 'workers/sqs/worker.js');

module.exports = class createRebillsController extends workerController {

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
			message: global.SixCRM.routes.path('model', 'workers/sqsmessage.json'),
			session: global.SixCRM.routes.path('model', 'entities/session.json'),
			rebill: global.SixCRM.routes.path('model', 'entities/rebill.json')
		};

		const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');

		this.rebillHelperController = new RebillHelperController();

		this.augmentParameters();

	}

	execute(message){

		du.debug('Execute');

		return this.setParameters({argumentation: {message: message}, action: 'execute'})
			.then(() => this.acquireSession())
			.then(() => this.createRebills())
			.then(() => this.respond())
			.catch(error => {
				return super.respond('error', error.message);
			});

	}

	acquireSession(){

		du.debug('Acquire Session');

		return Promise.resolve()
			.then(() => this.parseMessageBody())
			.then(() => {
				return super.acquireSession();
			});

	}

	createRebills(){

		du.debug('Create Rebills');

		let session = this.parameters.get('session');

		return this.rebillHelperController.createRebill({session: session}).then(rebill => {

			this.parameters.set('rebill', rebill);

			return true;

		});

	}

	respond(){

		du.debug('Respond');

		let rebill = this.parameters.get('rebill', {fatal: false});

		let response_code = 'fail';

		if(!_.isNull(rebill)){

			response_code = 'success';

		}

		return super.respond(response_code);

	}

}

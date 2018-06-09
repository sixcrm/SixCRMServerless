const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const StateController = global.SixCRM.routes.include('entities', 'State.js');

module.exports = class StateHelperController {

	constructor() {}

	async report(parameters) {

		du.debug('Report');

		let params = objectutilities.transcribe({
			account: 'account',
			entity: 'entity',
			name: 'name'
		}, parameters, {}, true);

		params = objectutilities.transcribe({
			execution: 'execution',
			step: 'step',
			message: 'message'
		}, parameters, params, false);

		return new StateController().create({entity: params});

	}

}

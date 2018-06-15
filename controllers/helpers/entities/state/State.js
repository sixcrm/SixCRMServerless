const _ = require('lodash');
const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const eu = require('@sixcrm/sixcrmcore/util/error-utilities').default;
const objectutilities = require('@sixcrm/sixcrmcore/util/object-utilities').default;
const parserutilities = require('@sixcrm/sixcrmcore/util/parser-utilities').default;
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

	buildExecutionArn(execution){

		du.debug('Build Execution ARN');

		if(!_.has(execution, 'name')){
			throw eu.getError('server', 'State requires "name" property in order to build a execution ARN');
		}

		if(!_.has(execution, 'execution')){
			throw eu.getError('server', 'State requires "execution" property in order to build a execution ARN');
		}

		const template = 'arn:aws:states:{{aws_region}}:{{aws_account}}:execution:{{state_machine_name}}:{{execution}}';

		const data = {
			aws_region: global.SixCRM.configuration.site_config.aws.region,
			aws_account: global.SixCRM.configuration.site_config.aws.account,
			state_machine_name: execution.name,
			execution: execution.execution
		};

		return parserutilities.parse(template, data);

	}

}

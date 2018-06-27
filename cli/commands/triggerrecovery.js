require('@6crm/sixcrmcore')
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;

const StepFunctionTriggerController = global.SixCRM.routes.include('workers','statemachine/components/stepFunctionTrigger.js');

module.exports.command = 'triggerrecovery';
module.exports.describe = 'Trigger recovery of a Rebill by UUID in the SixCRM State Machine.';

module.exports.builder = {
	rebillUUID: {
		demand: true,
		description: 'The UUID of the Rebill',
		nargs: 1
	},
	restart: {
		demand: false,
		description: 'Cancels any existing execution and restarts',
		nargs: 1,
		default: false
	}
};

module.exports.handler = (argv) => {

	_handler(argv)
		.then(() => {

			return process.exit();

		})
		.catch((ex) => {

			du.error('triggerrecovery#handler', ex);

			process.exit(1);

		});

}

async function _handler(argv) {

	const rebill_uuid =  argv.rebillUUID;

	const restart = (argv.restart == 'true' || argv.restart == true)?true:argv.restart;

	const parameters = {
		guid: rebill_uuid,
		stateMachineName: 'Recovery'
	};

	let result = await new StepFunctionTriggerController().execute(parameters, restart);

	du.info(result);

}

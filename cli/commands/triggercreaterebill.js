require('../../SixCRM.js')
const du = global.SixCRM.routes.include('lib','debug-utilities.js');

const StepFunctionTriggerController = global.SixCRM.routes.include('workers','statemachine/components/stepFunctionTrigger.js');

module.exports.command = 'triggercreaterebill';
module.exports.describe = 'Trigger the creation of the next rebill for a Session by UUID in the SixCRM State Machine.';

module.exports.builder = {
	sessionUUID: {
		demand: true,
		description: 'The UUID of the Session',
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

			du.error('triggercreaterebill#handler', ex);

			process.exit(1);

		});

}

async function _handler(argv) {

	const session_uuid =  argv.sessionUUID;

	const restart = (argv.restart == 'true' || argv.restart == true)?true:argv.restart;

	const parameters = {
		stateMachineName: 'Createrebill',
		guid: session_uuid
	};

	let result = await new StepFunctionTriggerController().execute(parameters, restart);

	du.info(result);

}

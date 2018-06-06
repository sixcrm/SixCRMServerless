require('../../SixCRM.js')
const du = global.SixCRM.routes.include('lib','debug-utilities.js');
const StateMachineHelperController = global.SixCRM.routes.include('helpers','statemachine/StateMachine.js');

module.exports.command = 'triggerclosesession';
module.exports.describe = 'Trigger closure of a Session by UUID in the SixCRM State Machine.';

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

			du.error('triggerclosesession#handler', ex);

			process.exit(1);

		});

}

async function _handler(argv) {

	const session_uuid =  argv.sessionUUID;

	const restart = argv.restart;

	const stateMachineHelperController = new StateMachineHelperController();

	const parameters = {
		stateMachineName: 'Closesession',
		input:JSON.stringify({guid: session_uuid})
	};

	let result  = await stateMachineHelperController.startExecution(parameters, restart);

	du.info(result);

}

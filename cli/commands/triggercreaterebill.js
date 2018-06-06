require('../../SixCRM.js')
const du = global.SixCRM.routes.include('lib','debug-utilities.js');
const StateMachineHelperController = global.SixCRM.routes.include('helpers','statemachine/StateMachine.js');

module.exports.command = 'triggercreaterebill';
module.exports.describe = 'Trigger the creation of the next rebill for a Session by UUID in the SixCRM State Machine.';

module.exports.builder = {
	sessionUUID: {
		demand: true,
		description: 'The UUID of the Session',
		nargs: 1
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

	const stateMachineHelperController = new StateMachineHelperController();

	const parameters = {
		stateMachineName: 'Createrebill',
		input:JSON.stringify({guid: session_uuid})
	};

	let result  = await stateMachineHelperController.startExecution(parameters);

	du.info(result);

}

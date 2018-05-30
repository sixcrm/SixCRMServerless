require('../../SixCRM.js')
const du = global.SixCRM.routes.include('lib','debug-utilities.js');
const StateMachineHelperController = global.SixCRM.routes.include('helpers','statemachine/StateMachine.js');

module.exports.command = 'triggerfulfillment';
module.exports.describe = 'Trigger fulfillment of a Rebill by UUID in the SixCRM State Machine.';

module.exports.builder = {
	rebillUUID: {
		demand: true,
		description: 'The UUID of the Rebill',
		nargs: 1
	}
};

module.exports.handler = (argv) => {

	_handler(argv)
		.then(() => {

			return process.exit();

		})
		.catch((ex) => {

			du.error('triggerfulfillment#handler', ex);

			process.exit(1);

		});

}

async function _handler(argv) {

	const rebill_uuid =  argv.rebillUUID;

	const stateMachineHelperController = new StateMachineHelperController();

	const parameters = {
		stateMachineName: 'Fulfillment',
		input: JSON.stringify({guid: rebill_uuid})
	};

	let result  = await stateMachineHelperController.startExecution(parameters);

	du.info(result);

}
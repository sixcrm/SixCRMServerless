require('../../SixCRM.js');
const du = global.SixCRM.routes.include('lib','debug-utilities.js');
const StateMachineHelperController = global.SixCRM.routes.include('helpers','statemachine/StateMachine.js');

module.exports.command = 'triggercarriertracking';
module.exports.describe = 'Trigger carrier tracking of a Shipping Receipt by UUID in the SixCRM State Machine.';

module.exports.builder = {
	shippingReceiptUUID: {
		demand: true,
		description: 'The UUID of the Shipping Receipt',
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

			du.error('triggercarriertracking#handler', ex);

			process.exit(1);

		});

}

async function _handler(argv) {

	const shipping_receipt_uuid =  argv.shippingReceiptUUID;

	const restart = argv.restart;

	const stateMachineHelperController = new StateMachineHelperController();

	const parameters = {
		stateMachineName: 'Tracking',
		input:JSON.stringify({guid: shipping_receipt_uuid})
	};

	let result  = await stateMachineHelperController.startExecution(parameters, restart);

	du.info(result);

}

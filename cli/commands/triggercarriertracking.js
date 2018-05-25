require('../../SixCRM.js')
const du = global.SixCRM.routes.include('lib','debug-utilities.js');
const StateMachineHelperController = global.SixCRM.routes.include('helpers','statemachine/StateMachine.js');

module.exports.command = 'triggercarriertracking';
module.exports.describe = 'Trigger carrier rracking of a Shipping Receipt by UUID in the SixCRM State Machine.';

module.exports.builder = {
	shippingReceiptUUID: {
		demand: true,
		description: 'The UUID of the Shipping Receipt',
		nargs: 1
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

	const stateMachineHelperController = new StateMachineHelperController();

	const parameters = {
		stateMachineName: 'Tracking',
		input:JSON.stringify({guid: shipping_receipt_uuid})
	};

	let result  = await stateMachineHelperController.startExecution(parameters);

	du.info(result);

}

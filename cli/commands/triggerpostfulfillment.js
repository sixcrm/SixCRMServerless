require('../../SixCRM.js')
const du = global.SixCRM.routes.include('lib','debug-utilities.js');

const StepFunctionTriggerController = global.SixCRM.routes.include('workers','statemachine/components/stepFunctionTrigger.js');

module.exports.command = 'triggerpostfulfillment';
module.exports.describe = 'Trigger post-fulfillment of a Shipping Receipt by UUID in the SixCRM State Machine.';

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

			du.error('triggerpostfulfillment#handler', ex);

			process.exit(1);

		});

}

async function _handler(argv) {

	const shipping_receipt_uuid =  argv.shippingReceiptUUID;

	//const restart = argv.restart;

	const parameters = {
		stateMachineName: 'Postfulfillment',
		guid: shipping_receipt_uuid
	};

	let result = await new StepFunctionTriggerController().execute({parameters: parameters});

	du.info(result);

}

require('@6crm/sixcrmcore');
const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;

const StepFunctionTriggerController = global.SixCRM.routes.include('workers','statemachine/components/stepFunctionTrigger.js');

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

	const restart = (argv.restart == 'true' || argv.restart == true)?true:argv.restart;

	const parameters = {
		stateMachineName: 'Tracking',
		guid: shipping_receipt_uuid
	};

	let result = await new StepFunctionTriggerController().execute(parameters, restart);

	du.info(result);

}

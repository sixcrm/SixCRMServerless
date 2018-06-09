require('../../SixCRM.js')
const du = global.SixCRM.routes.include('lib','debug-utilities.js');

const StepFunctionTriggerController = global.SixCRM.routes.include('workers','statemachine/components/stepFunctionTrigger.js');

module.exports.command = 'triggerprefulfillment';
module.exports.describe = 'Trigger pre-fulfillment of a Rebill by UUID in the SixCRM State Machine.';

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

			du.error('triggerprefulfillment#handler', ex);

			process.exit(1);

		});

}

async function _handler(argv) {

	const rebill_uuid =  argv.rebillUUID;

	//const restart = argv.restart;

	const parameters = {
		stateMachineName: 'Prefulfillment',
		input:{
			guid: rebill_uuid
		}
	};

	let result = await new StepFunctionTriggerController().execute(parameters);

	du.info(result);

}

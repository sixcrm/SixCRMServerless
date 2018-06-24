require('@sixcrm/sixcrmcore')
const _ = require('lodash');
const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const fileutilities = require('@sixcrm/sixcrmcore/util/file-utilities').default;

const StepFunctionTriggerController = global.SixCRM.routes.include('workers','statemachine/components/stepFunctionTrigger.js');

module.exports.command = 'triggercreaterebill';
module.exports.describe = 'Trigger the creation of the next rebill for a Session by UUID in the SixCRM State Machine.';

module.exports.builder = {
	file: {
		demand: false,
		description: 'path to a file containing a csv of Session UUIDs',
		nargs: 1
	},
	sessionUUID: {
		demand: false,
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

	if(!_.has(argv, 'file') && !_.has(argv, 'sessionUUID')){
		throw new Error('You must specify either the sessionUUID or the file');
	}

	const restart = (argv.restart == 'true' || argv.restart == true)?true:argv.restart;

	if(_.has(argv, 'sessionUUID') && argv.sessionUUID !== undefined && argv.sessionUUID !== null){

		const session_uuid =  argv.sessionUUID;

		const parameters = {
			stateMachineName: 'Createrebill',
			guid: session_uuid
		};

		let result = await new StepFunctionTriggerController().execute(parameters, restart);

		du.info(result);

	}else{

		let csv = await fileutilities.getFileContents(argv.file);

		let session_ids = csv.split(',').map(session_id => _.trim(session_id));

		let result = await new StepFunctionTriggerController().executeBulk({
			stateMachineName: 'Createrebill',
			guids: session_ids
		});

		du.info(result);

	}

}

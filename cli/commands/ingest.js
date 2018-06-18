const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const IngestHandler = require('../handlers/ingest-handler');

module.exports.command = 'ingest';

module.exports.describe = 'Ingest exported CRM files to SixCRM';

module.exports.builder = {
	crm: {
		demand: true,
		description: 'CRM to process \'l\' for Limelight',
		nargs: 1,
		choices: ['limelight'],
		default: 'limelight'
	},
	client: {
		demand: false,
		description: 'Client to extract, defaults to all',
		nargs: 1
	},
	extractDirectory: {
		demand: true,
		description: 'Location of the exported CRM files',
		nargs: 1
	},
	account: {
		demand: true,
		description: 'SixCRM account GUID to import to',
		nargs: 1
	}
};

module.exports.handler = (argv) => {

	_handler(argv)
		.then(() => {

			return process.exit();

		})
		.catch((ex) => {

			du.error('ingest#handler', ex);

			process.exit(1);

		});

}

async function _handler(argv) {

	const extractDirectory = argv.extractDirectory;
	const account =  argv.account;

	const args = {
		extractDirectory,
		account
	};

	du.info('ingest#handler: environment', args);

	const ingestHandler = new IngestHandler(account, extractDirectory);
	await ingestHandler.ingest();

	du.info('ingest#handler: done', args);

}

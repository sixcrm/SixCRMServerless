const du = require('../../lib/debug-utilities');

module.exports.command = 'ingest';

module.exports.describe = 'Ingest exported CRM files to SixCRM';

module.exports.builder = {
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

	du.info('ingest#handler: environment', {
		account,
		extractDirectory,
		version: 1
	});

	// if (argv.startDate) {

	// 	options.startDate = argv.startDate;

	// }

	// if (argv.endDate) {

	// 	options.endDate = argv.endDate;

	// }

	// do something!

}

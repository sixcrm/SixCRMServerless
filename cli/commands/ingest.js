const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const fs = require('fs-extra');
const path = require('path');

module.exports.command = 'ingest';

module.exports.describe = 'Ingest exported CRM files to SixCRM';

module.exports.builder = {
	'extract-directory': {
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

	const extractDirectory = argv['extract-directory'];
	const account =  argv.account;

	const args = {
		extractDirectory,
		account
	};

	du.info('ingest#handler: environment', args);

	if (!await fs.pathExists(path.join(process.cwd(), extractDirectory))) {

		throw new Error('Extract directory does not exist');

	}

	if (!await fs.pathExists(path.join(process.cwd(), extractDirectory, 'manifest.json'))) {

		throw new Error('Extract manifest does not exist');

	}

	const manifest = await fs.readJson(path.join(extractDirectory, 'manifest.json'));

	du.info('IngestHandler#ingest(): export manifest found', manifest);

	const crm = manifest.crm;
	const client = manifest.client;

	const IngestHandler = require(`../handlers/${crm}/${crm}-ingest-handler`);
	const ingestHandler = new IngestHandler(crm, client, account, extractDirectory);
	await ingestHandler.ingest();

}

const path = require('path');
const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;

module.exports.command = 'extract';

module.exports.describe = 'Extract data from a CRM';

module.exports.builder = {
	crm: {
		demand: true,
		description: 'CRM to process \'l\' for Limelight',
		nargs: 1,
		choices: ['limelight'],
		default: 'limelight'
	},
	client: {
		demand: true,
		description: 'Client to extract',
		nargs: 1
	},
	'api-user': {
		demand: true,
		description: 'API username',
		nargs: 1
	},
	'api-password': {
		demand: true,
		description: 'API password',
		nargs: 1
	},
	'web-user': {
		demand: true,
		description: 'Web username',
		nargs: 1
	},
	'web-password': {
		demand: true,
		description: 'Web password',
		nargs: 1
	}
};

module.exports.handler = (argv) => {

	_handler(argv)
		.then(() => {

			return process.exit();

		})
		.catch((ex) => {

			du.error('extract#handler', ex);

			process.exit(1);

		});

}

async function _handler(argv) {

	const crm = argv.crm;
	const client = argv.client;
	const apiUser = argv['api-user'];
	const apiPassword = argv['api-password'];
	const webUser = argv['web-user'];
	const webPassword = argv['web-password'];

	const artifactsDirectory = path.resolve(process.cwd(), 'extract', crm, client);

	const args = {
		crm,
		client,
		apiUser,
		apiPassword,
		webUser,
		webPassword,
		artifactsDirectory
	};

	du.info('extract#handler: environment', args);

	const ExtractHandler = require(`../handlers/${crm}/${crm}-extract-handler`);
	const handler = new ExtractHandler(args.client, args.apiUser, args.apiPassword, args.webUser, args.webPassword, args.artifactsDirectory);
	await handler.extract();

}

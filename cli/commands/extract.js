const path = require('path');
const du = require('../../lib/debug-utilities');

module.exports.command = 'extract';

module.exports.describe = 'Extract data from a CRM';

module.exports.builder = {
	crm: {
		demand: true,
		description: 'CRM to process \'l\' for Limelight',
		nargs: 1,
		choices: ['l'],
		default: 'l'
	},
	client: {
		demand: true,
		description: 'Client to extract',
		nargs: 1
	},
	user: {
		demand: true,
		description: 'Username',
		nargs: 1
	},
	password: {
		demand: true,
		description: 'Password',
		nargs: 1
	},
	// startDate: {
	// 	alias: 'startDate',
	// 	demand: false,
	// 	description: 'Start date to extract MM/DD/YYYY'
	// },
	// endDate: {
	// 	alias: 'endDate',
	// 	demand: false,
	// 	description: 'End date to extract MM/DD/YYYY'
	// }
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

	const crm = argv.crm === 'l' ? 'limelight' : '';
	const client = argv.client;
	const user =  argv.user;
	const password = argv.password;

	const artifactsDirectory = path.resolve(process.cwd(), 'extract', crm, client);

	const args = {
		crm,
		client,
		user,
		password,
		artifactsDirectory
	};

	du.info('extract#handler: environment', {
		crm: args.crm === 'l' ? 'limelight' : '',
		client: args.client,
		user: args.user,
		artifactsDirectory,
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

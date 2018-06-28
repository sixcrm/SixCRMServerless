require('@6crm/sixcrmcore')

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;

module.exports.command = 'syncronizeindexes';
module.exports.describe = 'Synchronizes the indexes between the SixCRM document data store (DynamoDB) and the SixCRM search cluster (CloudSearch)';

module.exports.builder = {
	fix: {
		demand: false,
		description: 'When set, the script will attempt to rectify the disparities between the search index and the document store database',
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

			du.error('syncronizeindexes#handler', ex);

			process.exit(1);

		});

}

async function _handler(argv) {

	const fix = (argv.fix == 'true' || argv.fix == true)?true:argv.fix;

	const ReIndexingHelperController = global.SixCRM.routes.include('helpers', 'indexing/ReIndexing.js');
	let reIndexingHelperController = new ReIndexingHelperController();

	let result = await reIndexingHelperController.execute(fix);

	du.info(result);

}

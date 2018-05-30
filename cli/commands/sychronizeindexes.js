require('../../SixCRM.js')
const _ = require('lodash');
const du = global.SixCRM.routes.include('lib','debug-utilities.js');

module.exports.command = 'syncronizeindexes';
module.exports.describe = 'Synchronizes the indexes between the SixCRM document data store (DynamoDB) and the SixCRM search cluster (CloudSearch)';

module.exports.builder = {
	fix: {
		demand: false,
		description: 'When set, the script will attempt to rectify the disparities between the search index and the document store database',
		nargs: 1
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

	const fix =  (_.has(argv, 'fix'))?argv.fix:false;

	const ReIndexingHelperController = global.SixCRM.routes.include('helpers', 'indexing/ReIndexing.js');
	let reIndexingHelperController = new ReIndexingHelperController();

	let result = await reIndexingHelperController.execute(fix);

	du.info(result);

}

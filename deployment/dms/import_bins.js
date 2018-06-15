require('@sixcrm/sixcrmcore');

const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const BinImporter = global.SixCRM.routes.include('deployment', 'utilities/bin-importer.js');
const binImporter = new BinImporter();

binImporter.import().then((result) => {
	return du.info(result);
}).catch(error => {
	du.error(error);
	du.warning(error.message);
});

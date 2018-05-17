if (!global.SixCRM.ajv) {
	const _ =  require('lodash');
	const Ajv = require('ajv');
	const glob = require('glob');
	const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

	const filenames = glob.sync('model/**/*.json');
	const models = arrayutilities.map(filenames, filename => require(`${__dirname}/../../${filename}`));
	const schemas = arrayutilities.filter(models, schema => !_.isUndefined(schema.$schema));

	global.SixCRM.ajv = new Ajv({
		format: 'full',
		allErrors: true,
		verbose: true,
		schemas
	});
}

module.exports = global.SixCRM.ajv

const _ =  require('lodash');
const Ajv = require('ajv');
const glob = require('glob');

const schemas = glob.sync('model/**/*.json')
	.map(filename => require(`${__dirname}/../../${filename}`))
	.filter(schema => !_.isUndefined(schema.$schema));

module.exports = new Ajv({
	format: 'full',
	allErrors: true,
	verbose: true,
	schemas
});

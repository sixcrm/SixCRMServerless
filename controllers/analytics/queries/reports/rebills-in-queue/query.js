const QueryParser = require('../query-parser');
const util = require('util');
const path = require('path');
const fs = require('fs');
const format = require('pg-format');

module.exports = async (parameters = {}) => {

	const readFile = util.promisify(fs.readFile);
	const query = await readFile(path.join(__dirname, 'query.sql'), 'utf8');

	const local = [];
	QueryParser.resolveFilterValue(local, 'fr', 'account', parameters);
	const filter = QueryParser.resolveFilterQuery(parameters, {
		account: true
	});

	let filterQuery = '';

	if (local.length > 0) {

		filterQuery = format.withArray(filter, local);

	}

	const queryParams = [
		parameters.queueName,
		parameters.queueName,
		filterQuery,
		parameters.queueName,
		parameters.direction || 'ASC',
		parameters.limit || 100,
		parameters.offset || 0
	];

	const finalQuery = format.withArray(query, queryParams);

	// console.log(finalQuery);

	return finalQuery;

}

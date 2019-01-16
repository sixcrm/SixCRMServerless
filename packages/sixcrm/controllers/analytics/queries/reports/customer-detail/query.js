const QueryParser = require('../query-parser');
const util = require('util');
const path = require('path');
const fs = require('fs');
const format = require('pg-format');

module.exports = async (parameters = {}) => {

	const readFile = util.promisify(fs.readFile);
	const query = await readFile(path.join(__dirname, 'query.sql'), 'utf8');

	const local = [];
	QueryParser.resolveFilterValue(local, 'c', 'account', parameters);
	QueryParser.resolveFilterValue(local, 'o', 'customerStatus', parameters);
	QueryParser.resolveFilterValue(local, 'c', 'firstname', parameters);
	QueryParser.resolveFilterValue(local, 'c', 'lastname', parameters);
	QueryParser.resolveFilterValue(local, 'c', 'email', parameters);
	QueryParser.resolveFilterValue(local, 'c', 'phone', parameters);
	QueryParser.resolveFilterValue(local, 'c', 'city', parameters);
	QueryParser.resolveFilterValue(local, 'c', 'state', parameters);
	QueryParser.resolveFilterValue(local, 'c', 'zip', parameters);
	const filter = QueryParser.resolveFilterQuery(parameters, {
		account: true,
		customerStatus: true,
		firstname: true,
		lastname: true,
		email: true,
		phone: true,
		city: true,
		state: true,
		zip: true
	});

	let filterQuery = '';

	if (local.length > 0) {

		filterQuery = format.withArray(filter, local);

	}

	const queryParams = [
		parameters.start,
		parameters.end,
		filterQuery,
		parameters.order,
		parameters.direction,
		parameters.limit,
		parameters.offset
	];

	const finalQuery = format.withArray(query, queryParams);

	// console.log(finalQuery);

	return finalQuery;

}

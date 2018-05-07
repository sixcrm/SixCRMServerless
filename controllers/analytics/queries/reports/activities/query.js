const format = require('pg-format');
const util = require('util');
const path = require('path');
const fs = require('fs');

module.exports = async (parameters = {}) => {

	const readFile = util.promisify(fs.readFile);
	const query = await readFile(path.join(__dirname, 'query.sql'), 'utf8');

	let filter = '';
	const filterValues = [];

	if (parameters.account) {

		filter += ' AND account = %L';
		filterValues.push(parameters.account);

	}

	const queryParameters = [
		parameters.actor,
		parameters.actorType,
		parameters.actedUpon,
		parameters.actedUponType,
		parameters.associatedWith,
		parameters.associatedWithType,
		parameters.start,
		parameters.end,
		format.withArray(filter, filterValues),
		parameters.order.join(','),
		parameters.limit,
		parameters.offset
	];

	return format.withArray(query, queryParameters);

}

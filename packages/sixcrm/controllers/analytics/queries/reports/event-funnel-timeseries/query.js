const QueryParser = require('../query-parser');
const util = require('util');
const path = require('path');
const fs = require('fs');
const format = require('pg-format');

module.exports = async (parameters = {}) => {

	const readFile = util.promisify(fs.readFile);
	const query = await readFile(path.join(__dirname, 'query.sql'), 'utf8');

	const local = [];
	QueryParser.resolveFilterValue(local, 'f', 'account', parameters);
	QueryParser.resolveFilterValue(local, 'f', 'campaign', parameters);
	QueryParser.resolveFilterValue(local, 'f', 'affiliate', parameters);
	QueryParser.resolveFilterValueSubId(local, 'f', parameters);
	const filter = QueryParser.resolveFilterQuery(parameters, {
		account: true,
		campaign: true,
		affiliate: true,
		subId: true
	});

	let filterQuery = '';

	if (local.length > 0) {

		filterQuery = format.withArray(filter, local);

	}

	const queryParams = [
		parameters.start,
		parameters.end,
		`1 ${parameters.period}`,
		parameters.period,
		parameters.start,
		parameters.end,
		parameters.eventType,
		filterQuery,
		parameters.period
	];

	const finalQuery = format.withArray(query, queryParams);

	// console.log(finalQuery);

	return finalQuery;

}

const QueryParser = require('../query-parser');
const util = require('util');
const path = require('path');
const fs = require('fs');
const format = require('pg-format');

module.exports = async (parameters = {}) => {

	const readFile = util.promisify(fs.readFile);
	const query = await readFile(path.join(__dirname, 'query.sql'), 'utf8');

	const local = [];
	QueryParser.resolveFilterValue(local, 's', 'account', parameters);
	QueryParser.resolveFilterValue(local, 's', 'alias', parameters);
	QueryParser.resolveFilterValue(local, 's', 'amount', parameters);
	QueryParser.resolveFilterValue(local, 's', 'status', parameters);
	QueryParser.resolveFilterValue(local, 's', 'cycle', parameters);
	QueryParser.resolveFilterValue(local, 's', 'interval', parameters);
	QueryParser.resolveFilterValue(local, 's', 'sessionAlias', parameters);
	QueryParser.resolveFilterValue(local, 's', 'campaignName', parameters);
	QueryParser.resolveFilterValue(local, 's', 'customerName', parameters);
	const filter = QueryParser.resolveFilterQuery(parameters, {
		account: true,
		alias: true,
		amount: true,
		status: true,
		cycle: true,
		interval: true,
		sessionAlias: true,
		campaignName: true,
		customerName: true,
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

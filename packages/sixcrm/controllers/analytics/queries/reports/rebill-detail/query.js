const QueryParser = require('../query-parser');
const util = require('util');
const path = require('path');
const fs = require('fs');
const format = require('pg-format');

module.exports = async (parameters = {}) => {

	const readFile = util.promisify(fs.readFile);
	const query = await readFile(path.join(__dirname, 'query.sql'), 'utf8');

	const local = [];
	QueryParser.resolveFilterValue(local, 'r', 'account', parameters);
	QueryParser.resolveFilterValue(local, 'r', 'alias', parameters);
	QueryParser.resolveFilterValue(local, 'r', 'amount', parameters);
	QueryParser.resolveFilterValue(local, 'r', 'type', parameters);
	QueryParser.resolveFilterValue(local, 'r', 'sessionAlias', parameters);
	QueryParser.resolveFilterValue(local, 'r', 'campaignName', parameters);
	QueryParser.resolveFilterValue(local, 'r', 'customerName', parameters);
	QueryParser.resolveFilterValue(local, 'r', 'orderStatus', parameters);
	const filter = QueryParser.resolveFilterQuery(parameters, {
		account: true,
		alias: true,
		amount: true,
		type: true,
		sessionAlias: true,
		campaignName: true,
		customerName: true,
		orderStatus: true
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

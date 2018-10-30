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
	QueryParser.resolveFilterValue(local, 's', 'productSchedule', parameters);
	QueryParser.resolveFilterValue(local, 's', 'rebillAlias', parameters);
	QueryParser.resolveFilterValue(local, 's', 'productScheduleName', parameters);
	QueryParser.resolveFilterValue(local, 's', 'amount', parameters);
	QueryParser.resolveFilterValue(local, 's', 'status', parameters);
	QueryParser.resolveFilterValue(local, 's', 'cycle', parameters);
	QueryParser.resolveFilterValue(local, 's', 'interval', parameters);
	QueryParser.resolveFilterValue(local, 's', 'sessionAlias', parameters);
	QueryParser.resolveFilterValue(local, 's', 'session', parameters);
	QueryParser.resolveFilterValue(local, 's', 'campaignName', parameters);
	QueryParser.resolveFilterValue(local, 's', 'merchantProviderName', parameters);
	QueryParser.resolveFilterValue(local, 's', 'customerName', parameters);
	const filter = QueryParser.resolveFilterQuery(parameters, {
		account: true,
		productSchedule: true,
		rebillAlias: true,
		productScheduleName: true,
		amount: true,
		status: true,
		cycle: true,
		interval: true,
		sessionAlias: true,
		session: true,
		campaignName: true,
		customerName: true,
		merchantProviderName: true,
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

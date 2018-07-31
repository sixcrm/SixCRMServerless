const QueryParser = require('../query-parser');
const util = require('util');
const path = require('path');
const fs = require('fs');
const format = require('pg-format');

module.exports = async (parameters = {}) => {

	const readFile = util.promisify(fs.readFile);
	const query = await readFile(path.join(__dirname, 'query.sql'), 'utf8');

	const local = [];
	QueryParser.resolveFilterValue(local, 't', 'account', parameters);
	QueryParser.resolveFilterValue(local, 't', 'mid', parameters);
	QueryParser.resolveFilterValue(local, 'c', 'chargeback', parameters);
	QueryParser.resolveFilterValue(local, 't', 'response', parameters);
	QueryParser.resolveFilterValue(local, 't', 'alias', parameters);
	QueryParser.resolveFilterValue(local, 't', 'rebill_alias', parameters);
	QueryParser.resolveFilterValue(local, 't', 'session_alias', parameters);
	QueryParser.resolveFilterValue(local, 't', 'campaign_name', parameters);
	QueryParser.resolveFilterValue(local, 't', 'customer_name', parameters);
	const filter = QueryParser.resolveFilterQuery(parameters, {
		account: true,
		mid: true,
		chargeback: true,
		response: true,
		alias: true,
		rebillAlias: true,
		sessionAlias: true,
		campaignName: true,
		customerName: true
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

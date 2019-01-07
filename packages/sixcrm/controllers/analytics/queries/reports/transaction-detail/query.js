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
	QueryParser.resolveFilterValue(local, 't', 'merchantCode', parameters);
	QueryParser.resolveFilterValue(local, 't', 'merchantMessage', parameters);
	QueryParser.resolveFilterValue(local, 't', 'alias', parameters);
	QueryParser.resolveFilterValue(local, 't', 'rebillAlias', parameters);
	QueryParser.resolveFilterValue(local, 't', 'sessionAlias', parameters);
	QueryParser.resolveFilterValue(local, 't', 'campaignName', parameters);
	QueryParser.resolveFilterValue(local, 't', 'customerName', parameters);
	QueryParser.resolveFilterValue(local, 't', 'transactionType', parameters);
	QueryParser.resolveFilterValue(local, 't', 'merchantProviderName', parameters);
	QueryParser.resolveFilterValue(local, 't', 'amount', parameters);
	const filter = QueryParser.resolveFilterQuery(parameters, {
		account: true,
		mid: true,
		chargeback: true,
		response: true,
		merchantCode: true,
		merchantMessage: true,
		alias: true,
		rebillAlias: true,
		sessionAlias: true,
		campaignName: true,
		customerName: true,
		transactionType: true,
		merchantProviderName: true,
		amount: true
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

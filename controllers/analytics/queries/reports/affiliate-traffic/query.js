const QueryParser = require('../query-parser');
const util = require('util');
const path = require('path');
const fs = require('fs');
const format = require('pg-format');

module.exports = async (parameters = {}) => {

	const readFile = util.promisify(fs.readFile);
	const query = await readFile(path.join(__dirname, 'query.sql'), 'utf8');

	const queryParameters = [];

	// 1
	let local = ['s', parameters.start, parameters.end];
	QueryParser.resolveFilterValue(local, 's', 'account', parameters);
	QueryParser.resolveFilterValue(local, 's', 'campaign', parameters);
	QueryParser.resolveFilterValue(local, 's', 'affiliate', parameters);
	QueryParser.resolveFilterValueSubId(local, 's', parameters);
	let filter = QueryParser.resolveFilterQuery(parameters, {
		range: true,
		account: true,
		campaign: true,
		affiliate: true,
		subId: true
	});
	queryParameters.push(format.withArray(filter, local));

	// 2
	local = ['s', parameters.start, parameters.end];
	QueryParser.resolveFilterValue(local, 's', 'account', parameters);
	QueryParser.resolveFilterValue(local, 's', 'campaign', parameters);
	QueryParser.resolveFilterValue(local, 's', 'affiliate', parameters);
	QueryParser.resolveFilterValueSubId(local, 's', parameters);
	filter = QueryParser.resolveFilterQuery(parameters, {
		range: true,
		account: true,
		campaign: true,
		affiliate: true,
		subId: true
	});
	queryParameters.push(format.withArray(filter, local));

	// 3
	local = ['s', parameters.start, parameters.end];
	QueryParser.resolveFilterValue(local, 's', 'account', parameters);
	QueryParser.resolveFilterValue(local, 's', 'campaign', parameters);
	QueryParser.resolveFilterValue(local, 's', 'affiliate', parameters);
	QueryParser.resolveFilterValueSubId(local, 's', parameters);
	QueryParser.resolveFilterValue(local, 't', 'mid', parameters);
	filter = QueryParser.resolveFilterQuery(parameters, {
		range: true,
		account: true,
		campaign: true,
		affiliate: true,
		subId: true,
		mid: true
	});
	queryParameters.push(format.withArray(filter, local));

	// 4
	local = ['s', parameters.start, parameters.end];
	QueryParser.resolveFilterValue(local, 's', 'account', parameters);
	QueryParser.resolveFilterValue(local, 's', 'campaign', parameters);
	QueryParser.resolveFilterValue(local, 's', 'affiliate', parameters);
	QueryParser.resolveFilterValueSubId(local, 's', parameters);
	QueryParser.resolveFilterValue(local, 't', 'mid', parameters);
	filter = QueryParser.resolveFilterQuery(parameters, {
		range: true,
		account: true,
		campaign: true,
		affiliate: true,
		subId: true,
		mid: true
	});
	queryParameters.push(format.withArray(filter, local));

	// 5
	local = ['s', parameters.start, parameters.end];
	QueryParser.resolveFilterValue(local, 's', 'account', parameters);
	QueryParser.resolveFilterValue(local, 's', 'campaign', parameters);
	QueryParser.resolveFilterValue(local, 's', 'affiliate', parameters);
	QueryParser.resolveFilterValueSubId(local, 's', parameters);
	QueryParser.resolveFilterValue(local, 't', 'mid', parameters);
	filter = QueryParser.resolveFilterQuery(parameters, {
		range: true,
		account: true,
		campaign: true,
		affiliate: true,
		subId: true,
		mid: true
	});
	queryParameters.push(format.withArray(filter, local));

	// 6
	local = ['s', parameters.start, parameters.end];
	QueryParser.resolveFilterValue(local, 's', 'account', parameters);
	QueryParser.resolveFilterValue(local, 's', 'campaign', parameters);
	QueryParser.resolveFilterValue(local, 's', 'affiliate', parameters);
	QueryParser.resolveFilterValueSubId(local, 's', parameters);
	filter = QueryParser.resolveFilterQuery(parameters, {
		range: true,
		account: true,
		campaign: true,
		affiliate: true,
		subId: true
	});
	queryParameters.push(format.withArray(filter, local));

	// 7
	local = ['s', parameters.start, parameters.end];
	QueryParser.resolveFilterValue(local, 's', 'account', parameters);
	QueryParser.resolveFilterValue(local, 's', 'campaign', parameters);
	QueryParser.resolveFilterValue(local, 's', 'affiliate', parameters);
	QueryParser.resolveFilterValueSubId(local, 's', parameters);
	QueryParser.resolveFilterValue(local, 't', 'mid', parameters);
	filter = QueryParser.resolveFilterQuery(parameters, {
		range: true,
		account: true,
		campaign: true,
		affiliate: true,
		subId: true,
		mid: true
	});
	queryParameters.push(format.withArray(filter, local));

	// 8
	local = ['s', parameters.start, parameters.end];
	QueryParser.resolveFilterValue(local, 's', 'account', parameters);
	QueryParser.resolveFilterValue(local, 's', 'campaign', parameters);
	QueryParser.resolveFilterValue(local, 's', 'affiliate', parameters);
	QueryParser.resolveFilterValueSubId(local, 's', parameters);
	QueryParser.resolveFilterValue(local, 't', 'mid', parameters);
	filter = QueryParser.resolveFilterQuery(parameters, {
		range: true,
		account: true,
		campaign: true,
		affiliate: true,
		subId: true,
		mid: true
	});
	queryParameters.push(format.withArray(filter, local));

	// 9
	local = ['s', parameters.start, parameters.end];
	QueryParser.resolveFilterValue(local, 's', 'account', parameters);
	QueryParser.resolveFilterValue(local, 's', 'campaign', parameters);
	QueryParser.resolveFilterValue(local, 's', 'affiliate', parameters);
	QueryParser.resolveFilterValueSubId(local, 's', parameters);
	QueryParser.resolveFilterValue(local, 't', 'mid', parameters);
	filter = QueryParser.resolveFilterQuery(parameters, {
		range: true,
		account: true,
		campaign: true,
		affiliate: true,
		subId: true,
		mid: true
	});
	queryParameters.push(format.withArray(filter, local));

	const finalQuery = format.withArray(query, queryParameters);

	// console.log(finalQuery);

	return finalQuery;

}

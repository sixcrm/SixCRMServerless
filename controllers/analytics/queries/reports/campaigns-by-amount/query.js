const QueryParser = require('../query-parser');
const util = require('util');
const path = require('path');
const fs = require('fs');
const format = require('pg-format');

module.exports = async (parameters = {}) => {

	const readFile = util.promisify(fs.readFile);
	const query = await readFile(path.join(__dirname, 'query.sql'), 'utf8');

	const local = ['t', parameters.start, parameters.end];
	QueryParser.resolveFilterValue(local, 't', 'account', parameters);
	QueryParser.resolveFilterValue(local, 't', 'campaign', parameters);
	QueryParser.resolveFilterValue(local, 't', 'affiliate', parameters);
	QueryParser.resolveFilterValueSubId(local, 't', parameters);
	const filter = QueryParser.resolveFilterQuery(parameters, {
		range: true,
		account: true,
		campaign: true,
		affiliate: true,
		subId: true
	});

	const filterQuery = format.withArray(filter, local)

	const queryParams = [filterQuery];

	if (parameters.direction) {

		queryParams.push(parameters.direction);

	} else {

		queryParams.push('ASC');

	}

	if (parameters.limit) {

		queryParams.push(parameters.limit);

	} else {

		queryParams.push(100);

	}

	const finalQuery = format.withArray(query, queryParams);

	// console.log(finalQuery);

	return finalQuery;

}

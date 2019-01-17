const QueryParser = require('../query-parser');
const util = require('util');
const path = require('path');
const fs = require('fs');
const format = require('pg-format');

module.exports = async (parameters = {}) => {

	const readFile = util.promisify(fs.readFile);
	const query = await readFile(path.join(__dirname, 'query.sql'), 'utf8');

	const local = ['e', parameters.start, parameters.end];
	QueryParser.resolveFilterValue(local, 'e', 'account', parameters);
	QueryParser.resolveFilterValue(local, 'e', 'campaign', parameters);
	QueryParser.resolveFilterValue(local, 'e', 'affiliate', parameters);
	QueryParser.resolveFilterValueSubId(local, 'e', parameters);
	const filter = QueryParser.resolveFilterQuery(parameters, {
		range: true,
		account: true,
		campaign: true,
		affiliate: true,
		subId: true
	});

	const filterQuery = format.withArray(filter, local)

	const finalQuery = format.withArray(query, [filterQuery]);

	// console.log(finalQuery);

	return finalQuery;

}

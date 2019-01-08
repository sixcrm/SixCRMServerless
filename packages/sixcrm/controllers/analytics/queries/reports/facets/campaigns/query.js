const format = require('pg-format');
const util = require('util');
const path = require('path');
const fs = require('fs');

module.exports = async (parameters = {}) => {

	const readFile = util.promisify(fs.readFile);
	const query = await readFile(path.join(__dirname, 'query.sql'), 'utf8');

	const queryParameters = [parameters.start, parameters.end];

	if (parameters.account) {

		queryParameters.push(format(' AND account = %L', parameters.account));

	} else {

		queryParameters.push('');

	}

	return format.withArray(query, queryParameters);

}

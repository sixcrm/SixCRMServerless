const util = require('util');
const path = require('path');
const fs = require('fs');
const format = require('pg-format');

module.exports = async (parameters = {}) => {

	const readFile = util.promisify(fs.readFile);
	const query = await readFile(path.join(__dirname, 'query.sql'), 'utf8');

	let filter = ' %s.datetime BETWEEN %L AND %L ';

	if (parameters.account) {

		filter += ' AND %s.account = %L ';

	}

	const queryParameters = [];

	for (let i = 0; i < 9; i++) {

		const local = ['s', parameters.start, parameters.end];

		if (parameters.account) {

			local.push('s');
			local.push(parameters.account);

		}

		queryParameters.push(format.withArray(filter, local))

	}

	return format.withArray(query, queryParameters)

}

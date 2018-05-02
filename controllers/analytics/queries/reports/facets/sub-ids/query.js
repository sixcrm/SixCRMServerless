const format = require('pg-format');
const util = require('util');
const path = require('path');
const fs = require('fs');

module.exports = async (parameters = {}) => {

	const readFile = util.promisify(fs.readFile);
	const query = await readFile(path.join(__dirname, 'query.sql'), 'utf8');

	const queryParameters = [];

	for (let i = 0; i < 5; i++) {

		const local = [...parameters.start, ...parameters.end];

		if (parameters.account) {

			local.push(format(' AND account = $1', parameters.account));

		} else {

			local.push('');

		}

		queryParameters.push(...local);

	}

	// console.log(queryParameters);
	console.log(format.withArray(query, queryParameters));
	// console.log(format.withArray(query, queryParameters));

	return format.withArray(query, queryParameters);

}

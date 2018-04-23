const format = require('pg-format');
const util = require('util');
const path = require('path');
const fs = require('fs');

module.exports = async (parameters = {}) => {

	const readFile = util.promisify(fs.readFile);
	const query = await readFile(path.join(__dirname, 'query.sql'), 'utf8');

	const queryParameters = [
		parameters.start,
		parameters.end,
		`1 ${parameters.period}`,
		parameters.period,
		parameters.start,
		parameters.end,
		resolveFilter(),
		parameters.period,
		parameters.period,
		parameters.start,
		parameters.end,
		resolveFilter(),
		parameters.period
	];

	if (parameters.account) {

		queryParameters.push(format(' AND account = $1', parameters.account));

	} else {

		queryParameters.push('');

	}

	return format.withArray(query, queryParameters);

	function resolveFilter() {

		if (parameters.account) {

			return format(' AND account = $1', parameters.account);

		} else {

			return '';

		}
	}

}

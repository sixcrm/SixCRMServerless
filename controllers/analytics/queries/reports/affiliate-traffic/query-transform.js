const util = require('util');
const path = require('path');
const fs = require('fs');
const format = require('pg-format');

module.exports = async (parameters = {}) => {

	const readFile = util.promisify(fs.readFile);
	const query = await readFile(path.join(__dirname, 'query.sql'), 'utf8');

	let filter = ' %s.datetime BETWEEN %L AND %L ';

	filter = _resolveFilterQuery(filter, 'account', 'account', parameters);
	filter = _resolveFilterQuery(filter, 'campaign', 'campaign', parameters);
	filter = _resolveFilterQuery(filter, 'affiliate', 'affiliate', parameters);

	// filter = _resolveFilterQuery(filter, 'mid', 'merchant_provider', parameters);
	// filter = _resolveFilterQuery(filter, 'product', parameters);
	// filter = _resolveFilterQuery(filter, 'productSchedule', parameters);
	// filter = _resolveFilterQuery(filter, 'subId', parameters);

	const queryParameters = [];

	for (let i = 0; i < 9; i++) {

		const local = ['s', parameters.start, parameters.end];

		_resolveFilterValue(local, 'account', parameters);
		_resolveFilterValue(local, 'campaign', parameters);
		_resolveFilterValue(local, 'affiliate', parameters);

		queryParameters.push(format.withArray(filter, local))

	}

	const finalQuery = format.withArray(query, queryParameters);

	// console.log(finalQuery);

	return finalQuery;

}

function _resolveFilterQuery(filter, identifier, map, parameters) {

	if (parameters[identifier]) {

		return filter += ` AND %s.${map} = %L `;

	} else {

		return filter;

	}

}

function _resolveFilterValue(local, identifier, parameters) {

	if (parameters[identifier]) {

		local.push('s');
		local.push(parameters[identifier]);

	}

}

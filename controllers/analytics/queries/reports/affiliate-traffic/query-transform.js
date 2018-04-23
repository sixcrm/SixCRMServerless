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
	filter = _resolveFilterQuerySubId(filter, parameters);

	// filter = _resolveFilterQuery(filter, 'mid', 'merchant_provider', parameters);
	// filter = _resolveFilterQuery(filter, 'product', parameters);
	// filter = _resolveFilterQuery(filter, 'productSchedule', parameters);


	const queryParameters = [];

	for (let i = 0; i < 9; i++) {

		const local = ['s', parameters.start, parameters.end];

		_resolveFilterValue(local, 'account', parameters);
		_resolveFilterValue(local, 'campaign', parameters);
		_resolveFilterValue(local, 'affiliate', parameters);
		_resolveFilterValueSubId(local, parameters);

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

function _resolveFilterQuerySubId(filter, parameters) {

	if (parameters['subId']) {

		return filter += ` AND (%s.subaffiliate_1 = %L OR  %s.subaffiliate_2 = %L OR %s.subaffiliate_3 = %L OR %s.subaffiliate_4 = %L OR %s.subaffiliate_5 = %L) `;

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

function _resolveFilterValueSubId(local, parameters) {

	if (parameters['subId']) {

		local.push('s');
		local.push(parameters['subId']);
		local.push('s');
		local.push(parameters['subId']);
		local.push('s');
		local.push(parameters['subId']);
		local.push('s');
		local.push(parameters['subId']);
		local.push('s');
		local.push(parameters['subId']);

	}

}

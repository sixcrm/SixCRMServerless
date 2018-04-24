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
	_resolveFilterValue(local, 's', 'account', parameters);
	_resolveFilterValue(local, 's', 'campaign', parameters);
	_resolveFilterValue(local, 's', 'affiliate', parameters);
	_resolveFilterValueSubId(local, parameters);
	let filter = _resolveFilterQuery(parameters, {
		range: true,
		account: true,
		campaign: true,
		affiliate: true,
		subId: true
	});
	queryParameters.push(format.withArray(filter, local));

	// 2
	local = ['s', parameters.start, parameters.end];
	_resolveFilterValue(local, 's', 'account', parameters);
	_resolveFilterValue(local, 's', 'campaign', parameters);
	_resolveFilterValue(local, 's', 'affiliate', parameters);
	_resolveFilterValueSubId(local, parameters);
	_resolveFilterValue(local, 't', 'mid', parameters);
	// _resolveFilterValue(local, 'tp', 'product', parameters);
	// _resolveFilterValue(local, 'tps', 'productSchedule', parameters);
	filter = _resolveFilterQuery(parameters, {
		range: true,
		account: true,
		campaign: true,
		affiliate: true,
		subId: true,
		mid: true,
		// product: true,
		// productSchedule: true
	});
	queryParameters.push(format.withArray(filter, local));

	// 3
	local = ['s', parameters.start, parameters.end];
	_resolveFilterValue(local, 's', 'account', parameters);
	_resolveFilterValue(local, 's', 'campaign', parameters);
	_resolveFilterValue(local, 's', 'affiliate', parameters);
	_resolveFilterValueSubId(local, parameters);
	filter = _resolveFilterQuery(parameters, {
		range: true,
		account: true,
		campaign: true,
		affiliate: true,
		subId: true
	});
	queryParameters.push(format.withArray(filter, local));

	// 4
	local = ['s', parameters.start, parameters.end];
	_resolveFilterValue(local, 's', 'account', parameters);
	_resolveFilterValue(local, 's', 'campaign', parameters);
	_resolveFilterValue(local, 's', 'affiliate', parameters);
	_resolveFilterValueSubId(local, parameters);
	_resolveFilterValue(local, 't', 'mid', parameters);
	// _resolveFilterValue(local, 'tp', 'product', parameters);
	// _resolveFilterValue(local, 'tps', 'productSchedule', parameters);
	filter = _resolveFilterQuery(parameters, {
		range: true,
		account: true,
		campaign: true,
		affiliate: true,
		subId: true,
		mid: true,
		// product: true,
		// productSchedule: true
	});
	queryParameters.push(format.withArray(filter, local));

	// 5
	local = ['s', parameters.start, parameters.end];
	_resolveFilterValue(local, 's', 'account', parameters);
	_resolveFilterValue(local, 's', 'campaign', parameters);
	_resolveFilterValue(local, 's', 'affiliate', parameters);
	_resolveFilterValueSubId(local, parameters);
	_resolveFilterValue(local, 't', 'mid', parameters);
	// _resolveFilterValue(local, 'tp', 'product', parameters);
	// _resolveFilterValue(local, 'tps', 'productSchedule', parameters);
	filter = _resolveFilterQuery(parameters, {
		range: true,
		account: true,
		campaign: true,
		affiliate: true,
		subId: true,
		mid: true,
		// product: true,
		// productSchedule: true
	});
	queryParameters.push(format.withArray(filter, local));

	// 6
	local = ['s', parameters.start, parameters.end];
	_resolveFilterValue(local, 's', 'account', parameters);
	_resolveFilterValue(local, 's', 'campaign', parameters);
	_resolveFilterValue(local, 's', 'affiliate', parameters);
	_resolveFilterValueSubId(local, parameters);
	filter = _resolveFilterQuery(parameters, {
		range: true,
		account: true,
		campaign: true,
		affiliate: true,
		subId: true
	});
	queryParameters.push(format.withArray(filter, local));

	// 7
	local = ['s', parameters.start, parameters.end];
	_resolveFilterValue(local, 's', 'account', parameters);
	_resolveFilterValue(local, 's', 'campaign', parameters);
	_resolveFilterValue(local, 's', 'affiliate', parameters);
	_resolveFilterValueSubId(local, parameters);
	_resolveFilterValue(local, 't', 'mid', parameters);
	// _resolveFilterValue(local, 'tp', 'product', parameters);
	// _resolveFilterValue(local, 'tps', 'productSchedule', parameters);
	filter = _resolveFilterQuery(parameters, {
		range: true,
		account: true,
		campaign: true,
		affiliate: true,
		subId: true,
		mid: true,
		// product: true,
		// productSchedule: true
	});
	queryParameters.push(format.withArray(filter, local));

	// 8
	local = [];
	// _resolveFilterValue(local, 'tp', 'product', parameters);
	// _resolveFilterValue(local, 'tps', 'productSchedule', parameters);
	filter = _resolveFilterQuery(parameters, {
		// product: true,
		// productSchedule: true
	});
	queryParameters.push(format.withArray(filter, local));

	// 9
	local = ['s', parameters.start, parameters.end];
	_resolveFilterValue(local, 's', 'account', parameters);
	_resolveFilterValue(local, 's', 'campaign', parameters);
	_resolveFilterValue(local, 's', 'affiliate', parameters);
	_resolveFilterValueSubId(local, parameters);
	_resolveFilterValue(local, 't', 'mid', parameters);
	filter = _resolveFilterQuery(parameters, {
		range: true,
		account: true,
		campaign: true,
		affiliate: true,
		subId: true,
		mid: true
	});
	queryParameters.push(format.withArray(filter, local));

	// 10
	local = [];
	// _resolveFilterValue(local, 'tp', 'product', parameters);
	// _resolveFilterValue(local, 'tps', 'productSchedule', parameters);
	filter = _resolveFilterQuery(parameters, {
		// product: true,
		// productSchedule: true
	});
	queryParameters.push(format.withArray(filter, local));

	// 11
	local = ['s', parameters.start, parameters.end];
	_resolveFilterValue(local, 's', 'account', parameters);
	_resolveFilterValue(local, 's', 'campaign', parameters);
	_resolveFilterValue(local, 's', 'affiliate', parameters);
	_resolveFilterValueSubId(local, parameters);
	_resolveFilterValue(local, 't', 'mid', parameters);
	filter = _resolveFilterQuery(parameters, {
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

function _resolveFilterQuery(parameters, options = {}) {

	let filter = '';

	if (options.range) {

		filter = ' %s.datetime BETWEEN %L AND %L ';

	}

	if (options.account) {

		filter = _resolveFilterQueryValue(filter, 'account', 'account', parameters);

	}

	if (options.campaign) {

		filter = _resolveFilterQueryValue(filter, 'campaign', 'campaign', parameters);

	}

	if (options.affiliate) {

		filter = _resolveFilterQueryValue(filter, 'affiliate', 'affiliate', parameters);

	}

	if (options.subId) {

		filter = _resolveFilterQueryValueSubId(filter, parameters);

	}

	if (options.mid) {

		filter = _resolveFilterQueryValue(filter, 'mid', 'merchant_provider', parameters);

	}

	if (options.product) {

		filter = _resolveFilterQueryValue(filter, 'product', 'product_id', parameters);

	}

	if (options.productSchedule) {

		filter = _resolveFilterQueryValue(filter, 'productSchedule', 'product_schedule_id', parameters);

	}

	return filter;
}

function _resolveFilterQueryValue(filter, identifier, map, parameters) {

	if (parameters[identifier]) {

		return filter += ` AND %s.${map} = %L `;

	} else {

		return filter;

	}

}

function _resolveFilterQueryValueSubId(filter, parameters) {

	if (parameters['subId']) {

		return filter += ` AND (%s.subaffiliate_1 = %L OR  %s.subaffiliate_2 = %L OR %s.subaffiliate_3 = %L OR %s.subaffiliate_4 = %L OR %s.subaffiliate_5 = %L) `;

	} else {

		return filter;

	}

}

function _resolveFilterValue(local, prefix, identifier, parameters) {

	if (parameters[identifier]) {

		local.push(prefix);
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
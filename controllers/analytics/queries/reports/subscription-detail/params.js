const eu = require('@6crm/sixcrmcore/util/error-utilities').default;

module.exports = async (parameters, pagination) => {

	const start = parameters.facets.find(f => f.facet === 'start');
	const end = parameters.facets.find(f => f.facet === 'end');
	const productSchedule = parameters.facets.find(f => f.facet === 'productSchedule');
	const rebillAlias = parameters.facets.find(f => f.facet === 'rebillAlias');
	const productScheduleName = parameters.facets.find(f => f.facet === 'productScheduleName');
	const amount = parameters.facets.find(f => f.facet === 'amount');
	const status = parameters.facets.find(f => f.facet === 'status');
	const cycle = parameters.facets.find(f => f.facet === 'cycle');
	const interval = parameters.facets.find(f => f.facet === 'interval');
	const sessionAlias = parameters.facets.find(f => f.facet === 'sessionAlias');
	const session = parameters.facets.find(f => f.facet === 'session');
	const campaignName = parameters.facets.find(f => f.facet === 'campaignName');
	const merchantProviderName = parameters.facets.find(f => f.facet === 'merchantProviderName');
	const customerName = parameters.facets.find(f => f.facet === 'customerName');

	if (start.length > 1) {

		throw eu.getError('server', 'Start can only have one value');

	}

	if (end.length > 1) {

		throw eu.getError('server', 'End can only have one value');

	}

	const params = {};

	_resolveParamValue('start', start);
	_resolveParamValue('end', end);
	_resolveParamValue('productSchedule', productSchedule);
	_resolveParamValue('rebillAlias', rebillAlias);
	_resolveParamValue('productScheduleName', productScheduleName);
	_resolveParamValue('amount', amount);
	_resolveParamValue('status', status);
	_resolveParamValue('cycle', cycle);
	_resolveParamValue('interval', interval);
	_resolveParamValue('sessionAlias', sessionAlias);
	_resolveParamValue('session', session);
	_resolveParamValue('campaignName', campaignName);
	_resolveParamValue('merchantProviderName', merchantProviderName);
	_resolveParamValue('customerName', customerName);

	if (pagination) {

		params.limit = pagination.limit;
		params.offset = pagination.offset;
		params.order = pagination.order;
		params.direction = pagination.direction;

	}

	return params;

	function _resolveParamValue(identifier, facet) {

		if (facet) {

			params[identifier] = facet.values;

		}

	}

}

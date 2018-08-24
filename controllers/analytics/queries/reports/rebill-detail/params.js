const eu = require('@6crm/sixcrmcore/util/error-utilities').default;

module.exports = async (parameters, pagination) => {

	const start = parameters.facets.find(f => f.facet === 'start');
	const end = parameters.facets.find(f => f.facet === 'end');
	const account = parameters.facets.find(f => f.facet === 'account');
	const alias = parameters.facets.find(f => f.facet === 'alias');
	const sessionAlias = parameters.facets.find(f => f.facet === 'sessionAlias');
	const campaignName = parameters.facets.find(f => f.facet === 'campaignName');
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
	_resolveParamValue('account', account);
	_resolveParamValue('alias', alias);
	_resolveParamValue('sessionAlias', sessionAlias);
	_resolveParamValue('campaignName', campaignName);
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

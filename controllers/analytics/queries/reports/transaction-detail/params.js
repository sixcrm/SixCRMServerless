const eu = require('@6crm/sixcrmcore/util/error-utilities').default;

module.exports = async (parameters, pagination) => {

	const start = parameters.facets.find(f => f.facet === 'start');
	const end = parameters.facets.find(f => f.facet === 'end');
	const account = parameters.facets.find(f => f.facet === 'account');
	const chargeback = parameters.facets.find(f => f.facet === 'chargeback');
	const response = parameters.facets.find(f => f.facet === 'response');
	const merchantProvider = parameters.facets.find(f => f.facet === 'mid');
	const alias = parameters.facets.find(f => f.facet === 'alias');
	const rebillAlias = parameters.facets.find(f => f.facet === 'rebillAlias');
	const sessionAlias = parameters.facets.find(f => f.facet === 'sessionAlias');
	const campaignName = parameters.facets.find(f => f.facet === 'campaignName');
	const customerName = parameters.facets.find(f => f.facet === 'customerName');
	const transactionType = parameters.facets.find(f => f.facet === 'transactionType');

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
	_resolveParamValue('chargeback', chargeback);
	_resolveParamValue('response', response);
	_resolveParamValue('mid', merchantProvider);
	_resolveParamValue('alias', alias);
	_resolveParamValue('rebillAlias', rebillAlias);
	_resolveParamValue('sessionAlias', sessionAlias);
	_resolveParamValue('campaignName', campaignName);
	_resolveParamValue('customerName', customerName);
	_resolveParamValue('transactionType', transactionType);

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

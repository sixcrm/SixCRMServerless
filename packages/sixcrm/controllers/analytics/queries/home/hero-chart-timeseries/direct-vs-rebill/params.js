const eu = require('@6crm/sixcrmcore/util/error-utilities').default;

module.exports = async (parameters = {}) => {

	const start = parameters.facets.find(f => f.facet === 'start');
	const end = parameters.facets.find(f => f.facet === 'end');
	const period = parameters.facets.find(f => f.facet === 'period');
	const campaign = parameters.facets.find(f => f.facet === 'campaign');

	if (start.length > 1) {

		throw eu.getError('server', 'Start can only have one value');

	}

	if (end.length > 1) {

		throw eu.getError('server', 'End can only have one value');

	}

	if (period && period.length > 1) {

		throw eu.getError('server', 'Period can only have one value');

	}

	const params = {};

	_resolveParamValue('start', start);
	_resolveParamValue('end', end);
	_resolveParamValue('period', period);
	_resolveParamValue('campaign', campaign);

	return params;

	function _resolveParamValue(identifier, facet) {

		if (facet) {

			params[identifier] = facet.values;

		}

	}

}

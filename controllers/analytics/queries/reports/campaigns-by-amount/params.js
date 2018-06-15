const eu = require('@sixcrm/sixcrmcore/util/error-utilities').default;

module.exports = async (parameters, pagination) => {

	const start = parameters.facets.find(f => f.facet === 'start');
	const end = parameters.facets.find(f => f.facet === 'end');
	const campaign = parameters.facets.find(f => f.facet === 'campaign');
	const affiliate = parameters.facets.find(f => f.facet === 'affiliate');
	const subId = parameters.facets.find(f => f.facet === 'subId');

	// merchant provider
	// processor_result
	// type
	// subtype

	if (start.length > 1) {

		throw eu.getError('server', 'Start can only have one value');

	}

	if (end.length > 1) {

		throw eu.getError('server', 'End can only have one value');

	}

	const params = {};

	_resolveParamValue('start', start);
	_resolveParamValue('end', end);
	_resolveParamValue('campaign', campaign);
	_resolveParamValue('affiliate', affiliate);
	_resolveParamValue('subId', subId);

	if (pagination) {

		params.limit = pagination.limit;
		params.direction = pagination.direction;

	}

	return params;

	function _resolveParamValue(identifier, facet) {

		if (facet) {

			params[identifier] = facet.values;

		}

	}

}

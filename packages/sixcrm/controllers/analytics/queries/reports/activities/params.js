const eu = require('@6crm/sixcrmcore/util/error-utilities').default;

module.exports = async (parameters = {}, pagination) => {

	const start = parameters.facets.find(f => f.facet === 'start');
	const end = parameters.facets.find(f => f.facet === 'end');
	const actor = parameters.facets.find(f => f.facet === 'actor');
	const actorType = parameters.facets.find(f => f.facet === 'actorType');
	const actedUpon = parameters.facets.find(f => f.facet === 'actedUpon');
	const actedUponType = parameters.facets.find(f => f.facet === 'actedUponType');
	const associatedWith = parameters.facets.find(f => f.facet === 'associatedWith');
	const associatedWithType = parameters.facets.find(f => f.facet === 'associatedWithType');

	if (start.length > 1) {

		throw eu.getError('server', 'Start can only have one value');

	}

	if (end.length > 1) {

		throw eu.getError('server', 'End can only have one value');

	}

	const params = {};

	_resolveParamValue('start', start);
	_resolveParamValue('end', end);
	_resolveParamValue('actor', actor);
	_resolveParamValue('actorType', actorType);
	_resolveParamValue('actedUpon', actedUpon);
	_resolveParamValue('actedUponType', actedUponType);
	_resolveParamValue('associatedWith', associatedWith);
	_resolveParamValue('associatedWithType', associatedWithType);

	if (pagination) {

		params.order = pagination.order;
		params.offset = pagination.offset;
		params.limit = pagination.limit;

	}

	return params;

	function _resolveParamValue(identifier, facet) {

		if (facet) {

			params[identifier] = facet.values;

		}

	}

}

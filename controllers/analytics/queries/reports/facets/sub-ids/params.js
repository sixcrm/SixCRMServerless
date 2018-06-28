const eu = require('@6crm/sixcrmcore/util/error-utilities').default;

module.exports = async (parameters = {}) => {

	const start = parameters.filter.filters.find(f => f.facet === 'start');
	const end = parameters.filter.filters.find(f => f.facet === 'end');

	if (start.length > 1) {

		throw eu.getError('server', 'Start can only have one value');

	}

	if (end.length > 1) {

		throw eu.getError('server', 'End can only have one value');

	}

	const params = {};

	_resolveParamValue('start', start);
	_resolveParamValue('end', end);

	return params;

	function _resolveParamValue(identifier, facet) {

		if (facet) {

			params[identifier] = facet.values;

		}

	}

}

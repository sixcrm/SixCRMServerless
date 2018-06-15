const eu = require('@sixcrm/sixcrmcore/util/error-utilities').default;

module.exports = async (parameters, pagination) => {

	const start = parameters.facets.find(f => f.facet === 'start');
	const end = parameters.facets.find(f => f.facet === 'end');
	const period = parameters.facets.find(f => f.facet === 'period');
	const queueName = parameters.facets.find(f => f.facet === 'queueName');

	if (start.length > 1) {

		throw eu.getError('server', 'Start can only have one value');

	}

	if (end.length > 1) {

		throw eu.getError('server', 'End can only have one value');

	}

	if (period.length > 1) {

		throw eu.getError('server', 'Period can only have one value');

	}

	if (queueName.length > 1) {

		throw eu.getError('server', 'Queue name can only have one value');

	}

	const params = {};

	_resolveParamValue('start', start);
	_resolveParamValue('end', end);
	_resolveParamValue('period', period);
	_resolveParamValue('queueName', queueName);

	if (pagination) {

		params.limit = pagination.limit;
		params.direction = pagination.direction;
		params.offset = pagination.offset;

	}

	return params;

	function _resolveParamValue(identifier, facet) {

		if (facet) {

			params[identifier] = facet.values;

		}

	}

}

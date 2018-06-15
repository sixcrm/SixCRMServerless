const eu = require('@sixcrm/sixcrmcore/util/error-utilities').default;

module.exports = async (parameters, pagination) => {

	const queueName = parameters.facets.find(f => f.facet === 'queueName');

	if (queueName.length > 1) {

		throw eu.getError('server', 'Queue name can only have one value');

	}

	const params = {};

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

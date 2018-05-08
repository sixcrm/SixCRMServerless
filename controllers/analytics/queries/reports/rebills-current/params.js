const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

module.exports = async (parameters) => {

	const queueName = parameters.facets.find(f => f.facet === 'queueName');

	if (queueName.length > 1) {

		throw eu.getError('server', 'Queue name can only have one value');

	}

	const params = {};

	_resolveParamValue('queueName', queueName);

	return params;

	function _resolveParamValue(identifier, facet) {

		if (facet) {

			params[identifier] = facet.values;

		}

	}

}

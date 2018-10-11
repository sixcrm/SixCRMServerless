const eu = require('@6crm/sixcrmcore/util/error-utilities').default;

module.exports = async (parameters, pagination) => {

	const start = parameters.facets.find(f => f.facet === 'start');
	const end = parameters.facets.find(f => f.facet === 'end');
	const customerStatus = parameters.facets.find(f => f.facet === 'customerStatus');
	const firstname = parameters.facets.find(f => f.facet === 'firstname');
	const lastname = parameters.facets.find(f => f.facet === 'lastname');
	const email = parameters.facets.find(f => f.facet === 'email');
	const phone = parameters.facets.find(f => f.facet === 'phone');
	const city = parameters.facets.find(f => f.facet === 'city');
	const state = parameters.facets.find(f => f.facet === 'state');
	const zip = parameters.facets.find(f => f.facet === 'zip');

	if (start.length > 1) {

		throw eu.getError('server', 'Start can only have one value');

	}

	if (end.length > 1) {

		throw eu.getError('server', 'End can only have one value');

	}

	const params = {};

	_resolveParamValue('start', start);
	_resolveParamValue('end', end);
	_resolveParamValue('customerStatus', customerStatus);
	_resolveParamValue('firstname', firstname);
	_resolveParamValue('lastname', lastname);
	_resolveParamValue('email', email);
	_resolveParamValue('phone', phone);
	_resolveParamValue('city', city);
	_resolveParamValue('state', state);
	_resolveParamValue('zip', zip);

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

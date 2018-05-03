const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

module.exports = async (parameters) => {

	const start = parameters.facets.find(f => f.facet === 'start');
	const end = parameters.facets.find(f => f.facet === 'end');
	const campaign = parameters.facets.find(f => f.facet === 'campaign');
	const affiliate = parameters.facets.find(f => f.facet === 'affiliate');
	const subId = parameters.facets.find(f => f.facet === 'subId');
	const mid = parameters.facets.find(f => f.facet === 'mid');
	const product = parameters.facets.find(f => f.facet === 'product');
	const productSchedule = parameters.facets.find(f => f.facet === 'productSchedule');

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
	_resolveParamValue('mid', mid);
	_resolveParamValue('product', product);
	_resolveParamValue('productSchedule', productSchedule);

	return params;

	function _resolveParamValue(identifier, facet) {

		if (facet) {

			params[identifier] = facet.values;

		}

	}

}

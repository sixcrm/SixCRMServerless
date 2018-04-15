
let _ = require('lodash');
let du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
let mathutilities = global.SixCRM.routes.include('lib', 'math-utilities.js');

module.exports = function(results, parameters){

	du.debug('Transformation Function');

	return new Promise((resolve) => {

		du.debug(results);

		let facets = [];

		let count_sum = 0;

		if(_.isArray(results) && results.length > 0){

			results.forEach((result) => {

				count_sum = parseInt(result.all_events_count);

				let total = Math.max(parseInt(result.all_events_count), 1);

				let percentage = mathutilities.formatToPercentage(mathutilities.safePercentage(result.events_count, total))+'%';

				facets.push(
					{
						facet: result[parameters.facet],
						count: parseInt(result.events_count),
						percentage: percentage
					}
				);


			});

		}

		let return_object = {
			count: count_sum,
			facet_type: parameters.facet,
			facets:facets
		};

		return resolve(return_object);

	});

}

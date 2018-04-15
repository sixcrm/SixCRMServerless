
let _ = require('lodash');
let mathutilities = global.SixCRM.routes.include('lib', 'math-utilities.js');
let du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = function(results){

	du.debug('Transformation Function');

	return new Promise((resolve) => {

		du.info(results);

		let return_object = {
			campaigns: []
		};

		if(_.isArray(results) && results.length > 0){

			results.forEach((result) => {

				return_object.campaigns.push({
					campaign: result.campaign,
					percent_change_amount:  mathutilities.formatToPercentage(result.percent_change_amount)+'%',
					percent_change_count: mathutilities.formatToPercentage(result.percent_change_count)+'%'
				});

			});

		}

		return resolve(return_object);

	});

}

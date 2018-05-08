const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = async (results) => {

	du.debug('Rebills current report');

	return {
		meta: {
			count: results.length
		},
		records: results.map(r => {

			let avg_time = {
				"days": 0,
				"hours": 0,
				"seconds": 0
			};

			if (!_.isEmpty(result.avg_time)) {
				avg_time = result.avg_time
			}

			if (_.isUndefined(avg_time.days)) {
				avg_time.days = 0
			}

			if (_.isUndefined(avg_time.hours)) {
				avg_time.hours = 0
			}

			if (_.isUndefined(avg_time.seconds)) {
				avg_time.seconds = 0
			}

			return Object.keys(r).map(k => {

				return {
					key: k,
					value: r[k]
				}

			})

		})

	};

}

// let du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
// let arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
// let paginationutilities = global.SixCRM.routes.include('lib', 'pagination-utilities.js');
// const _ = require('lodash');

// module.exports = function(results, parameters){

// 	du.debug('Transformation Function');

// 	let result_array = [];

// 	arrayutilities.map(results, (result) => {

// 		let avg_time = {
// 			"days": 0,
// 			"hours": 0,
// 			"seconds": 0
// 		};

// 		if ( !_.isEmpty(result.avg_time) ) {
// 			avg_time = result.avg_time
// 		}

// 		if ( _.isUndefined(avg_time.days) ) {
// 			avg_time.days = 0
// 		}

// 		if ( _.isUndefined(avg_time.hours) ) {
// 			avg_time.hours = 0
// 		}

// 		if ( _.isUndefined(avg_time.seconds) ) {
// 			avg_time.seconds = 0
// 		}

// 		result_array.push({
// 			queuename: result.queuename,
// 			avg_time: avg_time.days * 86400 + avg_time.hours * 3600 + avg_time.seconds,
// 			number_of_rebills: result.number_of_rebills,
// 			failure_rate: result.failure_rate
// 		});

// 	});

// 	parameters['count'] = results.length;

// 	let pagination_object = paginationutilities.createSQLPaginationObject(parameters);

// 	let return_object = {summary:result_array, pagination: pagination_object};

// 	return Promise.resolve(return_object);

// }


let du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = function(results){

	du.debug('Transformation Function');

	du.info(results);

	return new Promise((resolve) => {

		let return_object = {
			overview: {
				newsale: {
					count: results[0].new_sale_count,
					amount: results[0].new_sale_amount
				},
				rebill: {
					count: results[0].rebill_sale_count,
					amount: results[0].rebill_sale_amount
				},
				fail: {
					count: results[0].fail_count,
					amount: results[0].fail_amount
				},
				error: {
					count: results[0].error_count,
					amount: results[0].error_amount
				},
				main: {
					count: results[0].main_sale_count,
					amount: results[0].main_sale_amount
				},
				upsell: {
					count: results[0].upsell_sale_count,
					amount: results[0].upsell_sale_amount
				}
			}
		};

		return resolve(return_object);

	});

}

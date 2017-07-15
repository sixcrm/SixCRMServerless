'use strict';
let _ = require('underscore');
let du = global.routes.include('lib', 'debug-utilities.js');
let paginationutilities = global.routes.include('lib', 'pagination-utilities.js');

module.exports = function(results, parameters) {

  du.debug('Transformation Function');

  return new Promise((resolve, reject) => {

    let result_array = [];

    du.info(results);

    results.forEach((result) => {

      result_array.push({
        affiliate: result.affiliate,
        count_click: result.count_click,
        count_partials: result.count_partials,
        partials_percent: result.partials_percent,
        decline_count: result.decline_count,
        declines_percent: result.declines_percent,
        count_sales: result.count_sales,
        sales_percent: result.sales_percent,
        count_upsell: result.count_upsell,
        upsell_percent: result.upsell_percent,
        sum_upsell: result.sum_upsell,
        sum_amount: result.sum_amount,
        all_sum_amount: result.all_sum_amount,
        period: result.period
      });

    });

    parameters['count'] = results.length;

    let pagination_object = paginationutilities.createSQLPaginationObject(parameters);

    let return_object = {
      affiliates: result_array,
      pagination: pagination_object
    };

    return resolve(return_object);

  });

}

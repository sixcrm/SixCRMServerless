'use strict';
let _ = require('underscore');
let paginationutilities = global.SixCRM.routes.include('lib', 'pagination-utilities.js');
let du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = function(results, parameters){

    du.debug('Transformation Function');

    return new Promise((resolve) => {

        du.info(results);

        let return_array = [];

        if(_.isArray(results) && results.length > 0){

            results.forEach((result) => {

              return_array.push({
                affiliate: result.subaffiliate,
                count_click: result.count_click,
                count_partials: result.count_partials,
                partials_percent: result.partials_percent,
                fail_count: result.fail_count,
                fail_percent: result.fail_percent,
                count_sales: result.count_sales,
                sales_percent: result.sales_percent,
                count_upsell: result.count_upsell,
                upsell_percent: result.upsell_percent,
                sum_upsell: result.sum_upsell,
                sum_amount: result.sum_amount
              });

            });

        }

        du.highlight(return_array);

        parameters['count'] = return_array.length;

        let pagination_object = paginationutilities.createSQLPaginationObject(parameters);

        let return_object = {subaffiliates:return_array, pagination: pagination_object};

        return resolve(return_object);

    });

}

'use strict';
let _ = require('underscore');
let du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
let paginationutilities = global.SixCRM.routes.include('lib', 'pagination-utilities.js');

module.exports = function(results, parameters){

    du.debug('Transformation Function');

    du.info(results);

    return new Promise((resolve, reject) => {

        let result_array = [];

        du.info(results);

        results.forEach((result) => {

            result_array.push({
              merchant_provider:result.merchant_provider,
              sale_count:result.sale_count,
              sale_gross_revenue:result.sale_gross_revenue,
              refund_expenses:result.refund_expenses,
              refund_count:result.refund_count,
              net_Revenue:result.net_Revenue,
              mtd_sales_count:result.mtd_sales_count,
              mtd_gross_count:result.mtd_gross_count
            });

        });

        parameters['count'] = results.length;

        let pagination_object = paginationutilities.createSQLPaginationObject(parameters);

        let return_object = {events:result_array, pagination: pagination_object};


        return resolve(return_object);

    });

}

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
              gross_revenue:result.gross_revenue,
              gross_count: result.gross_count,
              chargeback_count: result.chargeback_count,
              refund_expenses: result.refund_expenses,
              refund_count: result.refund_count,
              declines_count: result.declines_count,
              declines_revenue: result.declines_revenue,
              sale_revenue: result.sale_revenue,
              sale_count: result.sale_count
            });

        });

        parameters['count'] = results.length;

        let pagination_object = paginationutilities.createSQLPaginationObject(parameters);

        let return_object = {periods:result_array, pagination: pagination_object};

        return resolve(return_object);

    });

}

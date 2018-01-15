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
            du.debug('Testing period');
            du.debug(result);
            result_array.push({
              period: result.period,
              sale_count: result.sale_count,
              sale_revenue: result.sale_revenue,
              rebill_count: result.rebill_count,
              rebill_revenue: result.rebill_revenue,
              refund_expenses: result.refund_expenses,
              refund_count: result.refund_count,
              gross_revenue: result.gross_revenue,
              declines_count: result.declines_count,
              declines_revenue: result.declines_revenue,
              chargeback_count: result.chargeback_count,
              current_active_customer: result.current_active_customer,
	            count_alert_count: result.count_alert_count
            });



        });

        parameters['count'] = results.length;

        let pagination_object = paginationutilities.createSQLPaginationObject(parameters);

        let return_object = {periods:result_array, pagination: pagination_object};

        return resolve(return_object);

    });

}

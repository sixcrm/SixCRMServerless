'use strict';
let du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = function(results, parameters){

    du.debug('Transformation Function');

    du.info(results);

    return new Promise((resolve, reject) => {

        let return_object = {
            overview: {
                sale: {
                    count: results[0].sale_count,
                    revenue: results[0].sale_revenue
                },
                rebill: {
                    count: results[0].rebill_count,
                    revenue: results[0].rebill_revenue
                },
                decline: {
                    count: results[0].declines_count,
                    revenue: results[0].declines_revenue
                },
                refund: {
                    count: results[0].refund_count,
                    expenses: results[0].refund_expenses
                },
                chargeback: {
                    count: results[0].chargeback_count
                },
                gross: {
                    revenue: results[0].gross_revenue
                }
            }
        };

        return resolve(return_object);

    });

}

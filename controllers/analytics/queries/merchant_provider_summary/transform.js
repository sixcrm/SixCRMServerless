'use strict';
let du = global.routes.include('lib', 'debug-utilities.js');

module.exports = function(results, parameters){

    du.debug('Transformation Function');
    return new Promise((resolve, reject) => {

        let return_object = {
            merchant_provider_overview: {
                merchant_provider_today: {
                    count: results[0].num_transactions_today,
                    amount: results[0].amount_transactions_today
                },
                merchant_provider_week: {
                    count: results[0].num_transactions_week,
                    amount: results[0].amount_transactions_week
                },
                merchant_provider_month: {
                    count: results[0].num_transactions_month,
                    amount: results[0].amount_transactions_month
                }
            }
        };

        return resolve(return_object);

    });

}

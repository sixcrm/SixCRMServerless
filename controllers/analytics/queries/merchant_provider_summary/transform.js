'use strict';
let du = global.routes.include('lib', 'debug-utilities.js');

module.exports = function(results, parameters){

    du.debug('Transformation Function');
    return new Promise((resolve, reject) => {

        let return_array = [];

        results.forEach((result) => {

          return_array.push({
              id:result.merchant_provider,
              today: {
                  count: result.num_transactions_today,
                  amount: result.amount_transactions_today
              },
              thisweek: {
                  count: result.num_transactions_week,
                  amount: result.amount_transactions_week
              },
              thismonth: {
                  count: result.num_transactions_month,
                  amount: result.amount_transactions_month
              }
          });

        });

        return resolve(return_array);

    });

}

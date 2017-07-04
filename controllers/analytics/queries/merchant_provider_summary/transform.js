'use strict';
let du = global.routes.include('lib', 'debug-utilities.js');
let paginationutilities = global.routes.include('lib', 'pagination-utilities.js');

module.exports = function(results, parameters){

    du.debug('Transformation Function');
    return new Promise((resolve, reject) => {

        let return_array = [];

        du.info(results);

        results.forEach((result) => {

          return_array.push({
              merchantprovider:{
                id: result.merchant_provider,
              },
              summary: {
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
              }
          });

        });

        parameters['count'] = results.length;

        let pagination_object = paginationutilities.createSQLPaginationObject(parameters);

        let return_object = {merchantproviders:return_array, pagination: pagination_object};

        du.output(return_object);

        return resolve(return_object);

    });

}

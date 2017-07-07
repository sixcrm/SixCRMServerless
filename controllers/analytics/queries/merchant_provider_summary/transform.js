'use strict';
let du = global.routes.include('lib', 'debug-utilities.js');
let paginationutilities = global.routes.include('lib', 'pagination-utilities.js');

module.exports = function(results, parameters){

    du.debug('Transformation Function');
    return new Promise((resolve, reject) => {

        let return_array = [];

        results.forEach((result) => {

          return_array.push({
              merchantprovider:{
                id: result.merchant_provider,
              },
              summary: {
                today: {
                  count: parseInt(result.num_transactions_today),
                  amount: parseFloat(result.amount_transactions_today)
                },
                thisweek: {
                  count: parseInt(result.num_transactions_week),
                  amount: parseFloat(result.amount_transactions_week)
                },
                thismonth: {
                  count: parseInt(result.num_transactions_month),
                  amount: parseFloat(result.amount_transactions_month)
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

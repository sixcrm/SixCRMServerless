

let du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
let paginationutilities = global.SixCRM.routes.include('lib', 'pagination-utilities.js');
let currencyutilities = global.SixCRM.routes.include('lib', 'currency-utilities.js');

module.exports = function(results, parameters){

    du.debug('Transformation Function');
    return new Promise((resolve) => {

        let return_array = [];

        results.forEach((result) => {

          return_array.push({
              merchantprovider:{
                id: result.merchant_provider,
              },
              summary: {
                today: {
                  count: parseInt(result.num_transactions_today),
                  amount: currencyutilities.toCurrency(parseFloat(result.amount_transactions_today))
                },
                thisweek: {
                  count: parseInt(result.num_transactions_week),
                  amount: currencyutilities.toCurrency(parseFloat(result.amount_transactions_week))
                },
                thismonth: {
                  count: parseInt(result.num_transactions_month),
                  amount: currencyutilities.toCurrency(parseFloat(result.amount_transactions_month))
                }
              }
          });

        });

        parameters['count'] = results.length;

        let pagination_object = paginationutilities.createSQLPaginationObject(parameters);

        let return_object = {merchantproviders:return_array, pagination: pagination_object};

        return resolve(return_object);

    });

}

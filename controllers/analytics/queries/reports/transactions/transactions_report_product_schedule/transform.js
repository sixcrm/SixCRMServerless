'use strict';
let du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
let arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
let paginationutilities = global.SixCRM.routes.include('lib', 'pagination-utilities.js');

module.exports = function(results, parameters){

  du.debug('Transformation Function');

  let result_array = [];

  arrayutilities.map(results, (result) => {

    result_array.push({
      id: result.id,
      datetime: result.datetime,
      customer: result.customer,
      merchant_provider: result.merchant_provider,
      campaign: result.campaign,
      affiliate: result.affiliate,
      amount: result.amount,
      processor_result: result.processor_result,
      transaction_type: result.type,
      cycle: result.cycle,
      recycle: result.recycle,
      gateway_response: null, //what is this?
      transaction_id_gateway: null //what is this?
    });

  });

  parameters['count'] = results.length;

  let pagination_object = paginationutilities.createSQLPaginationObject(parameters);

  let return_object = {transactions:result_array, pagination: pagination_object};

  return Promise.resolve(return_object);

}

'use strict';

let du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
let arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
let paginationutilities = global.SixCRM.routes.include('lib', 'pagination-utilities.js');

module.exports = function(results, parameters){

  du.debug('Transformation Function');

  let result_array = [];

  arrayutilities.map(results, (result) => {

    result_array.push({
      queue: result.queue,
      datetime: result.datetime,
      account: result.account,
      count: result.count
    });

  });

  parameters['count'] = results.length;

  let pagination_object = paginationutilities.createSQLPaginationObject(parameters);

  let return_object = {transactions:result_array, pagination: pagination_object};

  return Promise.resolve(return_object);

}

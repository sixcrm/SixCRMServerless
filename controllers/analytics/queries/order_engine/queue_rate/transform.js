'use strict';

let du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
let arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

module.exports = function(results, parameters){

  du.debug('Transformation Function');

  let result_array = [];

  arrayutilities.map(results, (result) => {

    result_array.push({
      failure_percentage: result.failure_rate,
      error_rate: result.error_rate,
      success_rate: result.success_rate,
      expired_rate: result.expired_rate,
      queuename: result.queuename
    });

  });

  parameters['count'] = results.length;

  let return_object = {summary:result_array};

  return Promise.resolve(return_object);

}

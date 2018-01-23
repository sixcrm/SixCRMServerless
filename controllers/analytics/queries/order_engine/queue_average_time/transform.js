'use strict';

let du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
let arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
let paginationutilities = global.SixCRM.routes.include('lib', 'pagination-utilities.js');

module.exports = function(results, parameters){

  du.debug('Transformation Function');

  let result_array = [];

  arrayutilities.map(results, (result) => {

    result_array.push({
      queuename: result.queuename,
      averagetime: result.average_time
    });

  });

  parameters['count'] = results.length;

  let return_object = {summary:result_array};

  return Promise.resolve(return_object);

};

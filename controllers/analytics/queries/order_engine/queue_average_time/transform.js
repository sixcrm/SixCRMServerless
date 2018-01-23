'use strict';

let du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
let arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
let paginationutilities = global.SixCRM.routes.include('lib', 'pagination-utilities.js');
const numberutilities = global.SixCRM.routes.include('lib', 'number-utilities.js');

module.exports = function(results, parameters){

  du.debug('Transformation Function');

  let result_array = [];

  arrayutilities.map(results, (result) => {

    let average_time = 0;
    if (numberutilities.isNumber(result.average_time)) {
        average_time = result.average_time
    }

    result_array.push({
      queuename: result.queuename,
      averagetime: average_time
    });

  });

  parameters['count'] = results.length;

  let return_object = {summary:result_array};

  return Promise.resolve(return_object);

};

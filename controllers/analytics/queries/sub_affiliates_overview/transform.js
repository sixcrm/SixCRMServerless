'use strict';
let _ = require('underscore');
let du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
let paginationutilities = global.SixCRM.routes.include('lib', 'pagination-utilities.js');

module.exports = function(results, parameters){

    du.debug('Transformation Function');

    return new Promise((resolve, reject) => {

        let result_array = [];

        du.info(results);

        results.forEach((result) => {

            result_array.push({
      			  affiliate: result.affiliate,
              amount: result.affiliate
            });

        });

        let return_object = {
            count: result_array.length,
            affiliates: result_array
        };

        return resolve(return_object);


    });

}

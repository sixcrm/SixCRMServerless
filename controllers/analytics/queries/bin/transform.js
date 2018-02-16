'use strict';
let _ = require('underscore');
let paginationutilities = global.SixCRM.routes.include('lib', 'pagination-utilities.js');
let du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = function(results, parameters){

    du.debug('Transformation Function');

    return new Promise((resolve) => {

        du.info(results);

        let return_array = [];

        if(_.isArray(results) && results.length > 0){

            results.forEach((result) => {

              return_array.push({
                  binnumber: result.binnumber,
                  brand: result.brand,
                  bank: result.bank,
                  type: result.type,
                  level: result.level,
                  country: result.country,
                  info: result.info,
                  country_iso: result.country_iso,
                  country2_iso: result.country2_iso,
                  country3_iso: result.country3_iso,
                  webpage: result.webpage,
                  phone: result.phone
              });

            });

        }

        du.info(return_array);

        parameters['count'] = return_array.length;

        let pagination_object = paginationutilities.createSQLPaginationObject(parameters);

        let return_object = {bins:return_array, pagination: pagination_object};

        return resolve(return_object);

    });

}

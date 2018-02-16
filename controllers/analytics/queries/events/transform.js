'use strict';
let _ = require('underscore');
let du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
let paginationutilities = global.SixCRM.routes.include('lib', 'pagination-utilities.js');

module.exports = function(results, parameters) {

  du.debug('Transformation Function');

  return new Promise((resolve) => {

    let result_array = [];

    du.info(results);

    results.forEach((result) => {

      result_array.push({
        session: result.session,
        type: result.type,
        datetime: result.datetime,
        account: result.account,
        campaign: result.campaign,
        product_schedule: result.product_schedule,
        affiliate: result.affiliate,
        subaffiliate_1: result.subaffiliate_1,
        subaffiliate_2: result.subaffiliate_2,
        subaffiliate_3: result.subaffiliate_3,
        subaffiliate_4: result.subaffiliate_4,
        subaffiliate_5: result.subaffiliate_5
      });

    });

    parameters['count'] = results.length;

    let pagination_object = paginationutilities.createSQLPaginationObject(parameters);

    let return_object = {
      affiliates: result_array,
      pagination: pagination_object
    };

    return resolve(return_object);

  });

}

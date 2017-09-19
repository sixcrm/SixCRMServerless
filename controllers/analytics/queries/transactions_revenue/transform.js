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
                id: result.id,
                datetime: result.datetime,
                customer: result.customer,
                merchant_provider: result.merchant_provider,
                campaign: result.campaign,
                affiliate: result.affiliate,
                amount: result.amount,
                processor_result: result.processor_result,
                transaction_type: result.transaction_type,
                cycle: result.cycle,
                recycle: result.recycle,
                gateway_response: result.gateway_response,
                mid_name: result.mid_name,
                transaction_id_gateway: result.transaction_id_gateway

            });

        });

        parameters['count'] = results.length;

        let pagination_object = paginationutilities.createSQLPaginationObject(parameters);

        let return_object = {transactions:result_array, pagination: pagination_object};

        return resolve(return_object);

    });

}

'use strict';
let _ = require('underscore');
let du = global.routes.include('lib', 'debug-utilities.js');
let paginationutilities = global.routes.include('lib', 'pagination-utilities.js');

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
                creditcard: result.creditcard,
                merchant_provider: result.merchant_provider,
                campaign: result.campaign,
                affiliate: result.affiliate,
                amount: result.amount,
                processor_result: result.processor_result,
                account: result.account,
                transaction_type: result.transaction_type,
                product_schedule: result.product_schedule,
                subaffiliate_1: result.subaffiliate_1,
                subaffiliate_2: result.subaffiliate_2,
                subaffiliate_3: result.subaffiliate_3,
                subaffiliate_4: result.subaffiliate_4,
                subaffiliate_5: result.subaffiliate_5,
                transaction_subtype: result.transaction_subtype
            });

        });

        parameters['count'] = results.length;

        let pagination_object = paginationutilities.createSQLPaginationObject(parameters);

        let return_object = {transactions:result_array, pagination: pagination_object};

        return resolve(return_object);

    });

}

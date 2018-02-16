'use strict';
let du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = function(results){

    du.debug('Transformation Function');

    return new Promise((resolve) => {

        let return_array = [];

        results.forEach((result) => {

            let found = false;

            return_array.forEach((return_object) => {

                if(return_object.id == result.merchant_provider){

                    found = true;

                    return_object[result.processor_result] = {
                        count:result.transaction_count,
                        amount:result.sum_amount
                    };

                }

            });

            if(found == false){

            //Technical Debt:  The name needs to be the Merchant Processor name from the database
                let mp_array = {
                    id: result.merchant_provider,
                    name: result.merchant_provider
                };

                mp_array[result.processor_result] = {
                    count:result.transaction_count,
                    amount:result.sum_amount
                };

                return_array.push(mp_array);

            }

        });

        let return_object = {merchant_providers: return_array};

        du.info(return_object);

        return resolve(return_object);

    });

}

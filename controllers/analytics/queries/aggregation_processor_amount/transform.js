'use strict'
let _ = require('underscore');
let du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
let timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');

module.exports = function(results, parameters){

    du.debug('Transformation Function');

    du.info(results);

    return new Promise((resolve) => {

        let return_object = [];

        results.forEach((result) => {

            let result_date_iso8601 = timestamp.convertToISO8601(result[parameters.period].toString());

            let match_identified = false;

            if(return_object.length > 0){

                for(var i = 0; i < return_object.length; i++){

                    if(_.has(return_object[i], 'datetime') && return_object[i].datetime == result_date_iso8601){

                        match_identified = true;

                        return return_object[i].byprocessorresult.push({
                            processor_result: result.processor_result.toString(),
                            count: result.transaction_count.toString(),
                            amount: result.sum_amount.toString()
                        });

                    }

                }

            }

            if(match_identified == false){

                return_object.push({
                    datetime: result_date_iso8601,
                    byprocessorresult: [{
                        processor_result: result.processor_result.toString(),
                        count: result.transaction_count.toString(),
                        amount: result.sum_amount.toString()
                    }]
                });

            }

        });

        //du.info("Observation Count: "+return_object.length);

        return resolve({
            transactions:return_object
        });

    });

}

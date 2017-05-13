'use strict';
let _ = require('underscore');
let du = require('../../../../lib/debug-utilities.js');
let mathutilities = require('../../../../lib/math-utilities.js');

module.exports = function(results, parameters){

    du.debug('Transformation Function');

    return new Promise((resolve, reject) => {

        let facets = [];

        let count_sum = 0;

        if(_.isArray(results) && results.length > 0){

            results.forEach((result) => {

                count_sum = parseInt(result.all_transactions);

                let facet_name = result[parameters.facet];

                let total = Math.max(parseInt(result.all_transactions), 1);

                let percentage = mathutilities.formatToPercentage(mathutilities.safePercentage(result.transactions_count, total))+'%';

                facets.push(
                    {
                        facet: result[parameters.facet],
                        count: parseInt(result.transactions_count),
                        percentage: percentage
                    }
                );


            });

        }

        let return_object = {
            count: count_sum,
            facet_type: parameters.facet,
            facets:facets
        };

        return resolve(return_object);

    });

}

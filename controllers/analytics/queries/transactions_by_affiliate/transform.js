'use strict';
let _ = require('underscore');
let du = require('../../../../lib/debug-utilities.js');
let mathutilities = require('../../../../lib/math-utilities.js');

module.exports = function(results, parameters){

    du.debug('Transformation Function');

    return new Promise((resolve, reject) => {

        let affiliates = [];

        let count_sum = 0;

        if(_.isArray(results) && results.length > 0){

            results.forEach((result) => {

                let affiliate_name = result.affiliate;

                if(_.isNull(affiliate_name) || _.isUndefined(affiliate_name)){
                    affiliate_name = 'No affiliate';
                }

                affiliates.push(
                    {
                        affiliate: affiliate_name,
                        count: parseInt(result.affiliate_count),
                        percentage: mathutilities.formatToPercentage(result.affiliate_perc)+'%'
                    }
            )

                count_sum += parseInt(result.affiliate_count);

            });

        }

        let return_object = {
            count: count_sum,
            affiliates:affiliates
        };

        //du.info(return_object);

        return resolve(return_object);

    });

}

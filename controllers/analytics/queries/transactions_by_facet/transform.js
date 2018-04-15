
let _ = require('underscore');
let du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
let mathutilities = global.SixCRM.routes.include('lib', 'math-utilities.js');

module.exports = function(results, parameters){

    du.debug('Transformation Function');

    return new Promise((resolve) => {

        du.info(results);

        let facets = [];

        let count_sum = 0;

        if(_.isArray(results) && results.length > 0){

            results.forEach((result) => {

                count_sum = parseInt(result.all_transactions_count);

                let count_total = Math.max(parseInt(result.all_transactions_count), 1);

                let count_percentage = mathutilities.formatToPercentage(mathutilities.safePercentage(result.transactions_count, count_total))+'%';

                let amount_total = Math.max(parseFloat(result.all_transactions_amount), 1.0);

                let amount_percentage = mathutilities.formatToPercentage(mathutilities.safePercentage(result.transactions_amount, amount_total))+'%';

                facets.push(
                    {
                        facet: result[parameters.facet],
                        count: parseInt(result.transactions_count),
                        count_percentage: count_percentage,
                        amount: parseFloat(result.transactions_amount),
                        amount_percentage: amount_percentage
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

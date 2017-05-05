module.exports = function(results, parameters){

    return new Promise((resolve, reject) => {

        let return_object = {
            overview: {
                newsale: {
                    count: results[0].new_sale_count,
                    amount: results[0].new_sale_amount
                },
                rebill: {
                    count: results[0].rebill_sale_count,
                    amount: results[0].rebill_sale_amount
                },
                decline: {
                    count: results[0].declines_count,
                    amount: results[0].declines_amount
                },
                error: {
                    count: results[0].error_count,
                    amount: results[0].error_amount
                },
                main: {
                    count: results[0].main_sale_count,
                    amount: results[0].main_sale_amount
                },
                upsell: {
                    count: results[0].upsell_sale_count,
                    amount: results[0].upsell_sale_amount
                }
            }
        };

        return resolve(return_object);

    });

}

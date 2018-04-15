
let _ = require('underscore');
let du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = function(results){

    du.debug('Transformation Function');

    return new Promise((resolve) => {

        du.info(results);

        let return_object = {
            campaigns: []
        };

        if(_.isArray(results) && results.length > 0){

            results.forEach((result) => {

          //Technical Debt:  Marry the campaigns to thier names
                return_object.campaigns.push({
                    campaign: result.campaign,
                    amount: result.campaign_amount,
                });

            });

        }

        du.info(return_object);

        return resolve(return_object);

    });

}

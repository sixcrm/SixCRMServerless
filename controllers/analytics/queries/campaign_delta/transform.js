'use strict';
let _ = require('underscore');
let mathutilities = require('../../../../lib/math-utilities.js');
let du = require('../../../../lib/debug-utilities.js');

module.exports = function(results, parameters){

    return new Promise((resolve, reject) => {

        du.info(results);

        let return_object = {
            campaigns: []
        };

        if(_.isArray(results) && results.length > 0){

            results.forEach((result) => {

          //Technical Debt:  Marry the campaigns to thier names
                return_object.campaigns.push({
                    campaign: result.campaign,
                    campaign_name: 'Fix me',
                    percent_change_amount:  mathutilities.formatToPercentage(result.percent_change_amount)+'%',
                    percent_change_count: mathutilities.formatToPercentage(result.percent_change_count)+'%'
                });

            });

        }



        du.info(return_object);

        return resolve(return_object);

    });

}

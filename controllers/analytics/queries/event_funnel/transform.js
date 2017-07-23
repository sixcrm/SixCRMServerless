'use strict';
let mathutilities = global.SixCRM.routes.include('lib', 'math-utilities.js');
let du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = function(results, parameters){

    du.debug('Transformation Function');

    let click = results[0].count_click;
    let lead = results[0].count_lead;
    let main = results[0].count_order;
    let upsell = results[0].count_upsell;
    let confirm = results[0].count_confirm;

    let return_object = {
        funnel: {
            click: {
                count: click,
                percentage: mathutilities.safePercentage(click, click),
                relative_percentage: mathutilities.safePercentage(0, click)
            },
            lead: {
                count: lead,
                percentage: mathutilities.safePercentage(lead, click),
                relative_percentage: mathutilities.safePercentage(lead, click)
            },
            main: {
                count: main,
                percentage: mathutilities.safePercentage(main, click),
                relative_percentage: mathutilities.safePercentage(main, lead)
            },
            upsell: {
                count: upsell,
                percentage: mathutilities.safePercentage(upsell, click),
                relative_percentage: mathutilities.safePercentage(upsell, main),
            },
            confirm: {
                count: results[0].count_confirm,
                percentage: mathutilities.safePercentage(confirm, click),
                relative_percentage: mathutilities.safePercentage(confirm, main),
            }
        }
    };

    return return_object;

}

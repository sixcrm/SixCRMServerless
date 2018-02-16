'use strict';
let _ = require('underscore');
let arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
let du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = function(results){

    du.debug('Transformation Function');

    if(arrayutilities.nonEmpty(results) && results.length == 1){

      let result = results[0];

      return Promise.resolve({
        count_click: result.count_click,
        count_partials: result.count_partials,
        partials_percent: result.partials_percent,
        decline_count: result.decline_count,
        declines_percent: result.declines_percent,
        count_sales: result.count_sales,
        sales_percent: result.sales_percent,
        count_upsell: result.count_upsell,
        upsell_percent: result.upsell_percent,
        sum_upsell: result.sum_upsell,
        sum_amount: result.sum_amount
      });

    }

    return Promise.resolve(null);

}

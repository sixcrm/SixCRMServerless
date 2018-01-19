'use strict';
let _ = require('underscore');
let du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
let paginationutilities = global.SixCRM.routes.include('lib', 'pagination-utilities.js');

module.exports = function(results, parameters){

  du.debug('Transformation Function');

  let result = results[0];

  return Promise.resolve({
    sale_count: result.sale_count,
    sale_revenue: result.sale_revenue,
    rebill_count: result.rebill_count,
    rebill_revenue: result.rebill_revenue,
    refund_expenses: result.refund_expenses,
    refund_count: result.refund_count,
    gross_revenue: result.gross_revenue,
    declines_count: result.declines_count,
    declines_revenue: result.declines_revenue,
    chargeback_count: result.chargeback_count,
    current_active_customer: result.current_active_customer,
    count_alert_count: result.count_alert_count
  });

}

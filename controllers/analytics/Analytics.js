'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const paginationutilities = global.SixCRM.routes.include('lib', 'pagination-utilities.js');

const AnalyticsUtilities = global.SixCRM.routes.include('controllers', 'analytics/AnalyticsUtilities.js');

class AnalyticsController extends AnalyticsUtilities{

    constructor(){

        super();

        this.default_query_filters = [
          'campaign',
          'merchant_provider',
          'product_schedule',
          'affiliate',
          's1',
          's2',
          's3',
          's4',
          's5',
          'account'
        ];

        this.default_activity_query_filters = [
          'action',
          'actor',
          'actor_type',
          'acted_upon',
          'acted_upon_type',
          'associated_with',
          'associated_with_type',
          'account'
        ];

        this.default_bin_query_filters = [
          'binnumber',
          'brand',
          'bank',
          'type',
          'level',
          'country',
          'info',
          'country_iso',
          'country2_iso',
          'country3_iso',
          'webpage',
          'phone'
        ];

        this.default_queue_filters = [
          'queuename',
          'current_queuename',
          'account'
        ];

        this.default_queue_account_filter = [
          'account'
        ];

    }

    getBINList(parameters){

      du.debug('Get BIN List');

      parameters = paginationutilities.mergePagination(parameters.binfilter, paginationutilities.createSQLPaginationInput(parameters.pagination));

      return this.getResults('bin', parameters, this.default_bin_query_filters);

    }

    getMerchantProviderSummaries(parameters){

      du.debug('Get Merchant Provider Summaries');

      parameters = paginationutilities.mergePagination(parameters.analyticsfilter, paginationutilities.createSQLPaginationInput(parameters.pagination));

      if(!_.has(parameters, 'order_field')){
        parameters.order_field = 'merchant_provider';
      }

      //Technical Debt: Get this out of here...
      if(_.has(parameters, 'merchantprovider')){
        parameters.merchant_provider = parameters.merchantprovider;
      }

      //Technical Debt:  What.  A.  Mess.
      if(_.has(parameters, 'merchant_provider') && _.isArray(parameters.merchant_provider) && parameters.merchant_provider.length > 0){

        let union = [];

        parameters.merchant_provider.forEach((merchant_provider) => {

          union.push("UNION ALL\nSELECT\n\t'"+merchant_provider+"'merchant_provider,\n\t0 num_transactions_today,\n\t0 num_transactions_week,\n\t0 num_transactions_month,\n\t0 amount_transactions_today,\n\t0 amount_transactions_week,\n\t0 amount_transactions_month");

        });

        union = arrayutilities.compress(union,"\n",'');
        parameters.union = union;

      }

      if(!_.has(parameters, 'product_schedule')){
        return this.getResults('merchant_provider_summary', parameters, arrayutilities.merge(this.default_query_filters));
      } else {
        return this.getResults('merchant_provider_summary_product_schedules', parameters, arrayutilities.merge(this.default_query_filters));
      }

    }

    getTransactions(parameters){

        du.debug('Get Transactions');

        parameters = paginationutilities.mergePagination(parameters.analyticsfilter, paginationutilities.createSQLPaginationInput(parameters.pagination));

        return this.getResults('transactions', parameters, this.default_query_filters);

    }

    getEvents(parameters){

        du.debug('Get Events');

        parameters = paginationutilities.mergePagination(parameters.analyticsfilter, paginationutilities.createSQLPaginationInput(parameters.pagination));

        return this.getResults('events', parameters, this.default_query_filters);

    }

    getCampaignsByAmount(parameters){

        du.debug('Get Campaigns By Amount');

        parameters = paginationutilities.mergePagination(parameters.analyticsfilter, paginationutilities.createSQLPaginationInput({limit: 10, order: 'desc'}));

        if(!_.has(parameters, 'product_schedule')){
          return this.getResults('campaigns_by_amount', parameters, this.default_query_filters);
        } else {
          return this.getResults('campaigns_by_amount_product_schedule', parameters, this.default_query_filters);
        }

    }

    //Technical Debt:  update to transaction facet timeseries
    getMerchantProviderAmount(parameters){

        du.debug('Get Merchant Provider Amount');

        return this.getResults('merchant_provider_amount', parameters.analyticsfilter, this.default_query_filters);

    }

    getEventSummary(parameters){

        du.debug('Get Event Summary');

        let target_period_count = this.getTargetPeriodCount(parameters.analyticsfilter);

        let period_selection = this.periodSelection(parameters.analyticsfilter.start, parameters.analyticsfilter.end, target_period_count);

        parameters = this.appendPeriod(parameters.analyticsfilter, period_selection);

        return this.getResults('aggregation_event_type_count', parameters, this.default_query_filters);

    }

    getEventFunnel(parameters){

        du.debug('Get Event Funnel');

        return this.getResults('event_funnel', parameters.analyticsfilter, this.default_query_filters);

    }

    getEventsByFacet(parameters){

        du.debug('Get Events By Facet');

        let merged_parameters = paginationutilities.mergePagination(parameters.analyticsfilter, paginationutilities.createSQLPaginationInput(parameters.pagination));

        merged_parameters.facet = parameters.facet;

        return this.getResults('events_by_facet', merged_parameters, this.default_query_filters);

    }

    getTransactionsByFacet(parameters){

        du.debug('Get Transactions By Facet');

        let merged_parameters = paginationutilities.mergePagination(parameters.analyticsfilter, paginationutilities.createSQLPaginationInput(parameters.pagination));

        merged_parameters.facet = parameters.facet;

        if(!_.has(parameters.analyticsfilter, 'product_schedule')){
          return this.getResults('transactions_by_facet', merged_parameters, this.default_query_filters);
        } else {
          return this.getResults('transactions_by_facet_product_schedule', parameters.analyticsfilter, this.default_query_filters);
        }

    }

    getTransactionOverview(parameters){

        du.debug('Get Transaction Overview');
        du.debug(parameters);

        if(!_.has(parameters.analyticsfilter, 'product_schedule')){
          return this.getResults('transaction_summary', parameters.analyticsfilter, this.default_query_filters);
        } else {
          return this.getResults('transaction_summary_product_schedule', parameters.analyticsfilter, this.default_query_filters);
        }

    }

    getTransactionOverviewWithRebills(parameters){

      du.debug('Get Transaction Overview With Rebills');

      return this.getTransactionOverview(parameters)
        .then((result) => {
          const rebillController = global.SixCRM.routes.include('controllers','entities/Rebill.js');

          return rebillController.getRebillsBilledAfter(timestamp.getISO8601())
            .then((rebills) => {
              const count = rebills.length;
              const amount = rebills.map(r => r.amount).reduce((a, b) => a + b, 0).toFixed(2);

              result.overview.rebill = {count: +count, amount: +amount};

              return result;
            })
        })
    }

    getTransactionSummary(parameters){

        du.debug('Get Transaction Summary');

        let target_period_count = this.getTargetPeriodCount(parameters.analyticsfilter);

        let period_selection = this.periodSelection(parameters.analyticsfilter.start, parameters.analyticsfilter.end, target_period_count);

        parameters = this.appendPeriod(parameters.analyticsfilter, period_selection);

        if(!_.has(parameters.analyticsfilter, 'product_schedule')){
          return this.getResults('aggregation_processor_amount', parameters, this.default_query_filters);
        } else {
          return this.getResults('aggregation_processor_amount_product_schedule', parameters, this.default_query_filters);
        }

    }

    getQueueSummary(parameters){

      du.debug('Get Queue Summary');

      const queuename = parameters.queuename;

      parameters = paginationutilities.mergePagination(parameters.analyticsfilter, paginationutilities.createSQLPaginationInput(parameters.pagination));

      parameters = this.appendQueueName(parameters, queuename);

      return this.getResults('order_engine/queue_pagination', parameters, this.default_queue_filters);

    }

    getCurrentQueueSummary(parameters){

      du.debug('Get Rebills current queue summary');

      const queuename = parameters.queuename;

      parameters = this.appendQueueName(parameters, queuename);

      return this.getResults('order_engine/rebills_current_summary', parameters, this.default_queue_account_filter);

    }

    getRebillSummary(parameters){

      du.debug('Get Rebill Summary');

      const queue_name = parameters.queuename;
      const period = parameters.period;

      du.debug(parameters);
      parameters = paginationutilities.mergePagination(parameters.analyticsfilter, paginationutilities.createSQLPaginationInput(parameters.pagination));

      if(!_.isUndefined(queue_name)){
        parameters = this.appendQueueName(parameters, queue_name);
      }

      parameters = this.appendPeriod(parameters, {name: period});
      du.debug(parameters);
      return this.getResults('order_engine/rebill_pagination', parameters, this.default_queue_account_filter);

    }

  getQueueRates(parameters){
      du.debug('Get Queue Failure');

      const queue_name = parameters.queuename;

      parameters = paginationutilities.mergePagination(parameters.analyticsfilter, paginationutilities.createSQLPaginationInput(parameters.pagination));

      if(!_.isUndefined(queue_name)){
        parameters = this.appendQueueName(parameters, queue_name);
      }

      return this.getResults('order_engine/queue_rate', parameters, this.default_queue_account_filter);
    }

    getQueueAverageTime(parameters){
      du.debug('Get Average Time of Messages in Queue');

      const queue_name = parameters.queuename;

      parameters = paginationutilities.mergePagination(parameters.analyticsfilter, paginationutilities.createSQLPaginationInput(parameters.pagination));

      if(!_.isUndefined(queue_name)){
        parameters = this.appendQueueName(parameters, queue_name);
      }
      du.debug(queue_name)
      return this.getResults('order_engine/queue_average_time', parameters, this.default_queue_account_filter);
    }

    getRebillsInQueue(parameters){

        const queue_name = parameters.queuename;

        du.debug('Get Rebills In Queue', queue_name);

        parameters = paginationutilities.mergePagination(parameters.analyticsfilter, paginationutilities.createSQLPaginationInput(parameters.pagination));

        if(!_.isUndefined(queue_name)){
            parameters = this.appendQueueName(parameters, queue_name);
        }

        return this.getResults('order_engine/rebills_in_queue', parameters, this.default_query_filters);

    }

    /* Report Pages */

    getAffiliateReportSubaffiliates(parameters){

        du.debug('Get Affiliate Report Subaffiliates');

        du.debug(parameters);

        let target_period_count = this.getTargetPeriodCount(parameters.analyticsfilter);

        let period_selection = this.periodSelection(parameters.analyticsfilter.start, parameters.analyticsfilter.end, target_period_count);

        parameters = paginationutilities.mergePagination(parameters.analyticsfilter, paginationutilities.createSQLPaginationInput(parameters.pagination));

        parameters = this.appendPeriod(parameters, period_selection);

        if(!_.has(parameters, 'product_schedule')){
          return this.getResults('reports/affiliate/affiliate_report_subaffiliates', parameters, this.default_query_filters);
        } else {
          return this.getResults('reports/affiliate/affiliate_report_subaffiliates_product_schedule', parameters, this.default_query_filters);
        }

    }

    getAffiliateReportSubaffiliatesOverview(parameters){

        du.debug('Get Affiliate Report Subaffiliates Overview');

        let target_period_count = this.getTargetPeriodCount(parameters.analyticsfilter);

        let period_selection = this.periodSelection(parameters.analyticsfilter.start, parameters.analyticsfilter.end, target_period_count);

        parameters = paginationutilities.mergePagination(parameters.analyticsfilter, paginationutilities.createSQLPaginationInput(parameters.pagination));

        parameters = this.appendPeriod(parameters, period_selection);

        if(!_.has(parameters, 'product_schedule')){
          return this.getResults('reports/affiliate/affiliate_report_subaffiliates_overview', parameters, this.default_query_filters);
        } else {
          return this.getResults('reports/affiliate/affiliate_report_subaffiliates_overview_product_schedule', parameters, this.default_query_filters);
        }

    }

    getAffiliateReportSummary(parameters){

        du.debug('Get Affiliate Report Summary');

        let target_period_count = this.getTargetPeriodCount(parameters.analyticsfilter);

        let period_selection = this.periodSelection(parameters.analyticsfilter.start, parameters.analyticsfilter.end, target_period_count);

        parameters = paginationutilities.mergePagination(parameters.analyticsfilter, paginationutilities.createSQLPaginationInput(parameters.pagination));

        parameters = this.appendPeriod(parameters, period_selection);

        if(!_.has(parameters, 'product_schedule')){
          return this.getResults('reports/affiliate/affiliate_report_summary', parameters, this.default_query_filters);
        } else {
          return this.getResults('reports/affiliate/affiliate_report_summary_product_schedule', parameters, this.default_query_filters);
        }

    }

    getAffiliateReport(parameters){

        du.debug('Get Affiliate Report');

        let target_period_count = this.getTargetPeriodCount(parameters.analyticsfilter);

        let period_selection = this.periodSelection(parameters.analyticsfilter.start, parameters.analyticsfilter.end, target_period_count);

        parameters = paginationutilities.mergePagination(parameters.analyticsfilter, paginationutilities.createSQLPaginationInput(parameters.pagination));

        parameters = this.appendPeriod(parameters, period_selection);

        if(!_.has(parameters, 'product_schedule')){
          return this.getResults('reports/affiliate/affiliate_report', parameters, this.default_query_filters);
        } else {
          return this.getResults('reports/affiliate/affiliate_report_product_schedule', parameters, this.default_query_filters);
        }

    }

    getMerchantReport(parameters){

        du.debug('Get Merchant Report');

        let target_period_count = this.getTargetPeriodCount(parameters.analyticsfilter);

        du.debug('Get Merchant Report parameters');
        du.debug(parameters);

        let period_selection = this.periodSelection(parameters.analyticsfilter.start, parameters.analyticsfilter.end, target_period_count);

        parameters = paginationutilities.mergePagination(parameters.analyticsfilter, paginationutilities.createSQLPaginationInput(parameters.pagination));

        parameters = this.appendPeriod(parameters, period_selection);

        du.debug('Get Merchant Report parameters after merge');
        du.debug(parameters);

        if(!_.has(parameters, 'product_schedule')){
          return this.getResults('reports/merchantprovider/merchantprovider_report', parameters, this.default_query_filters);
        } else {
          return this.getResults('reports/merchantprovider/merchantprovider_report_product_schedule', parameters, this.default_query_filters);
        }

    }

    getTransactionSummaryReportSummary(parameters){

        du.debug('Get Transactions Report Summary');

        let period_selection = this.periodSelection(parameters.analyticsfilter.start, parameters.analyticsfilter.end, 1);

        parameters = this.appendPeriod(parameters.analyticsfilter, period_selection);

        if(!_.has(parameters, 'product_schedule')){
          return this.getResults('reports/transactionsummary/transaction_summary_report_summary', parameters, this.default_query_filters);
        } else {
          return this.getResults('reports/transactionsummary/transaction_summary_report_summary_product_schedule', parameters, this.default_query_filters);
        }

    }

    getTransactionSummaryReport(parameters){

        du.debug('Get Transactions Report Timeseries');
        du.info(parameters);

        let target_period_count = this.getTargetPeriodCount(parameters.analyticsfilter);

        let period_selection = this.periodSelection(parameters.analyticsfilter.start, parameters.analyticsfilter.end, target_period_count);

        parameters = paginationutilities.mergePagination(parameters.analyticsfilter, paginationutilities.createSQLPaginationInput(parameters.pagination));

        parameters = this.appendPeriod(parameters, period_selection);

        /* In case product schedule is use as a parameter use a different query */

        if(!_.has(parameters, 'product_schedule')){
          return this.getResults('reports/transactionsummary/transaction_summary_report', parameters, this.default_query_filters);
        } else {
          return this.getResults('reports/transactionsummary/transaction_summary_report_product_schedule', parameters, this.default_query_filters);
        }

    }

    getTransactionsReport(parameters){

      du.info(parameters);
      du.debug('Get Transaction Report');

      parameters = paginationutilities.mergePagination(parameters.analyticsfilter, paginationutilities.createSQLPaginationInput(parameters.pagination));

      if(!_.has(parameters, 'product_schedule')){
        return this.getResults('reports/transactions/transactions_report', parameters, this.default_query_filters);
      } else {
        return this.getResults('reports/transactions/transactions_report_product_schedule', parameters, this.default_query_filters);
      }

    }
    /* End Report Pages */

    getCampaignDelta(parameters){

        du.debug('Get Campaign Delta');

        parameters = paginationutilities.mergePagination(parameters.analyticsfilter, paginationutilities.createSQLPaginationInput({limit: 10, order: 'desc'}));

        if(!_.has(parameters, 'product_schedule')){
          return this.getResults('campaign_delta', parameters, this.default_query_filters);
        } else {
          return this.getResults('campaign_delta_product_schedule', parameters, this.default_query_filters);
        }

    }

    getActivity(args){

        du.debug('Get Activity');

        let parameters = paginationutilities.mergePagination(args.activityfilter, paginationutilities.createSQLPaginationInput(args.pagination));

        return this.getResults('activity', parameters, this.default_activity_query_filters);

    }

    getActivityByIdentifier(args){

        du.debug('Get Activity By Identifier');

        let activity_filter = this.getActivityFilter(args);

        let pagination = this.getPagination(args);

        let parameters = paginationutilities.mergePagination(activity_filter, paginationutilities.createSQLPaginationInput(pagination));

        let this_query_filter = this.default_activity_query_filters;

        ['actor', 'actor_type','acted_upon', 'acted_upon_type','associated_with', 'associated_with_type'].forEach((argument) => {
            this_query_filter = arrayutilities.removeElement(this_query_filter, argument);
        });
        return this.getResults('activity_by_identifier', parameters, this_query_filter);

    }

    getPagination(parameters){

        if(_.has(parameters, 'pagination')){
            return parameters.pagination;
        }

        return null;

    }

    getBINNumber(parameters){

      if(_.has(parameters, 'binnumber')){
        return parameters.binnumber;
      }

      return null;

    }

    getAnalyticsFilter(parameters){

        if(_.has(parameters, 'analyticsfilter')){
            return parameters.analyticsfilter;
        }

        return null;

    }

    getActivityFilter(parameters){

        if(_.has(parameters, 'activityfilter')){
            return parameters.activityfilter;
        }

        return null;

    }

}

module.exports = new AnalyticsController();

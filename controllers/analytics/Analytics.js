'use strict';
const du = require('../../lib/debug-utilities.js');
const AnalyticsUtilities = require('./AnalyticsUtilities.js');

class AnalyticsController extends AnalyticsUtilities {

    constructor(){

        super();

        this.default_query_filters = [
            'campaign',
            'merchant_provider',
            'affiliate',
            's1',
            's2',
            's3',
            's4',
            's5',
            'account'
        ];

    }

    //new
    getEventsByFacet(){

    }

    //new
    getTransactionsByFacet(){

    }

    //new
    getTransactions(){


    }

    //new
    getEvents(){

    }

    getEventSummary(parameters){

        du.debug('Get Event Summary');

        let target_period_count = this.getTargetPeriodCount(parameters);

        let period_selection = this.periodSelection(parameters.start, parameters.end, target_period_count);

        parameters = this.appendPeriod(parameters, period_selection);

        return this.getResults('aggregation_event_type_count', parameters, this.default_query_filters);

    }

    getCampaignsByAmount(parameters){

        du.debug('Get Campaigns By Amount');

        parameters.limit = 10;
        parameters.order = 'desc';

        return this.getResults('campaigns_by_amount', parameters, this.default_query_filters);

    }

    getMerchantProviderAmount(parameters){

        du.debug('Get Merchant Provider Amount');

        return this.getResults('merchant_provider_amount', parameters, this.default_query_filters);

    }

    getEventsByAffiliate(parameters){

        du.debug('Get Events By Affiliate');

        parameters.limit = 10;
        parameters.order = 'desc';

        return this.getResults('events_by_affiliate', parameters, this.default_query_filters);

    }

    getTransactionsByAffiliate(parameters){

        du.debug('Get Transactions By Affiliate');

        parameters.limit = 10;
        parameters.order = 'desc';

        return this.getResults('transactions_by_affiliate', parameters, this.default_query_filters);

    }

    getTransactionOverview(parameters){

        du.debug('Get Transaction Overview');

        return this.getResults('transaction_summary', parameters, this.default_query_filters);

    }

    getTransactionSummary(parameters){

        du.debug('Get Transaction Summary');

        let target_period_count = this.getTargetPeriodCount(parameters);

        let period_selection = this.periodSelection(parameters.start, parameters.end, target_period_count);

        parameters = this.appendPeriod(parameters, period_selection);

        return this.getResults('aggregation_processor_amount', parameters, this.default_query_filters);

    }

    getCampaignDelta(parameters){

        du.debug('Get Campaign Delta');

        //Technical Debt:  This should be incorporated with the parameters, I think...
        parameters.limit = 20;

        return this.getResults('campaign_delta', parameters, this.default_query_filters);

    }

    getEventFunnel(parameters){

        du.debug('Get Campaign Delta');

        return this.getResults('event_funnel', parameters, this.default_query_filters);

    }

}

module.exports = new AnalyticsController();

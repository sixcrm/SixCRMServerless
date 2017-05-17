'use strict';
const du = global.routes.include('lib', 'debug-utilities.js');
const paginationutilities = global.routes.include('lib', 'pagination-utilities.js');

const AnalyticsUtilities = global.routes.include('controllers', 'analytics/AnalyticsUtilities.js');

class AnalyticsController extends AnalyticsUtilities{

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

    getEventsByFacet(parameters, pagination, facet){

        du.debug('Get Events By Facet');

        parameters.facet = facet;

        parameters = paginationutilities.mergePagination(parameters, paginationutilities.createSQLPaginationInput(pagination));

        return this.getResults('events_by_facet', parameters, this.default_query_filters);

    }

    getTransactionsByFacet(parameters, pagination, facet){

        du.debug('Get Transactions By Facet');

        parameters.facet = facet;

        parameters = paginationutilities.mergePagination(parameters, paginationutilities.createSQLPaginationInput(pagination));

        return this.getResults('transactions_by_facet', parameters, this.default_query_filters);

    }

    getTransactions(parameters, pagination){

        du.debug('Get Transactions');

        parameters = paginationutilities.mergePagination(parameters, paginationutilities.createSQLPaginationInput(pagination));

        return this.getResults('transactions', parameters, this.default_query_filters);

    }

    getEvents(parameters, pagination){

        du.debug('Get Events');

        parameters = paginationutilities.mergePagination(parameters, paginationutilities.createSQLPaginationInput(pagination));

        return this.getResults('events', parameters, this.default_query_filters);

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

        parameters = paginationutilities.mergePagination(parameters, paginationutilities.createSQLPaginationInput({limit: 10, order: 'desc'}));

        return this.getResults('campaigns_by_amount', parameters, this.default_query_filters);

    }

    getMerchantProviderAmount(parameters){

        du.debug('Get Merchant Provider Amount');

        return this.getResults('merchant_provider_amount', parameters, this.default_query_filters);

    }

    getEventsByAffiliate(parameters){

        du.debug('Get Events By Affiliate');

        parameters = paginationutilities.mergePagination(parameters, paginationutilities.createSQLPaginationInput({limit: 10, order: 'desc'}));

        return this.getResults('events_by_affiliate', parameters, this.default_query_filters);

    }

    getTransactionsByAffiliate(parameters){

        du.debug('Get Transactions By Affiliate');

        parameters = paginationutilities.mergePagination(parameters, paginationutilities.createSQLPaginationInput({limit: 10, order: 'desc'}));

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

        parameters = paginationutilities.mergePagination(parameters, paginationutilities.createSQLPaginationInput({limit: 10, order: 'desc'}));

        return this.getResults('campaign_delta', parameters, this.default_query_filters);

    }

    getEventFunnel(parameters){

        du.debug('Get Campaign Delta');

        return this.getResults('event_funnel', parameters, this.default_query_filters);

    }

}

module.exports = new AnalyticsController();

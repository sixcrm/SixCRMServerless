'use strict';
const _ = require('underscore');

const du = global.routes.include('lib', 'debug-utilities.js');
const paginationutilities = global.routes.include('lib', 'pagination-utilities.js');
const parserutilities = global.routes.include('lib', 'parser-utilities.js');

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

    }

    executeAnalyticsFunction(argumentation, function_name){

        if(_.isFunction(this[function_name])){

            this.setCacheSettings(argumentation);

            return this[function_name](argumentation);

        }else{

            throw new Error('AnalyticsController.'+function_name+' is not defined.');

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

        return this.getResults('campaigns_by_amount', parameters, this.default_query_filters);

    }

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

        du.debug('Get Campaign Delta');

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

        return this.getResults('transactions_by_facet', merged_parameters, this.default_query_filters);

    }

    getTransactionOverview(parameters){

        du.debug('Get Transaction Overview');

        return this.getResults('transaction_summary', parameters.analyticsfilter, this.default_query_filters);

    }

    getTransactionSummary(parameters){

        du.debug('Get Transaction Summary');

        let target_period_count = this.getTargetPeriodCount(parameters.analyticsfilter);

        let period_selection = this.periodSelection(parameters.analyticsfilter.start, parameters.analyticsfilter.end, target_period_count);

        parameters = this.appendPeriod(parameters.analyticsfilter, period_selection);

        return this.getResults('aggregation_processor_amount', parameters, this.default_query_filters);

    }

    getCampaignDelta(parameters){

        du.debug('Get Campaign Delta');

        parameters = paginationutilities.mergePagination(parameters.analyticsfilter, paginationutilities.createSQLPaginationInput({limit: 10, order: 'desc'}));

        return this.getResults('campaign_delta', parameters, this.default_query_filters);

    }

    getActivity(args){

        du.debug('Get Activity');

        let parameters = paginationutilities.mergePagination(args.activityfilter, paginationutilities.createSQLPaginationInput(args.pagination));

        let filters = this.default_activity_query_filters;

        return this.getResults('activity', parameters, filters);

    }

    getActivityByIdentifier(args){

        du.debug('Get Activity By Identifier');

        let activity_filter = this.getActivityFilter(args);

        let pagination = this.getPagination(args);

        let parameters = paginationutilities.mergePagination(activity_filter, paginationutilities.createSQLPaginationInput(pagination));

        return this.getResults('activity_by_identifier', parameters, this.default_activity_query_filters);

    }

    getPagination(parameters){

        if(_.has(parameters, 'pagination')){
            return parameters.pagination;
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

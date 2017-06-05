'use strict';
const _ = require('underscore');

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

        this.activity_optional_params = [
            'actor',
            'actor_type',
            'action',
            'acted_upon',
            'acted_upon_type',
            'associated_with',
            'associated_with_type'
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

    getEventsByFacet(parameters){

        du.debug('Get Events By Facet');

        parameters = paginationutilities.mergePagination(parameters.analyticsfilter, paginationutilities.createSQLPaginationInput(parameters.pagination));

        return this.getResults('events_by_facet', parameters, this.default_query_filters);

    }

    getTransactionsByFacet(parameters){

        du.debug('Get Transactions By Facet');

        //parameters.facet = parameters.facet;

        parameters = paginationutilities.mergePagination(parameters.analyticsfilter, paginationutilities.createSQLPaginationInput(parameters.pagination));

        return this.getResults('transactions_by_facet', parameters, this.default_query_filters);

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

    getEventSummary(parameters){

        du.debug('Get Event Summary');

        let target_period_count = this.getTargetPeriodCount(parameters.analyticsfilter);

        let period_selection = this.periodSelection(parameters.analyticsfilter.start, parameters.analyticsfilter.end, target_period_count);

        parameters = this.appendPeriod(parameters.analyticsfilter, period_selection);

        return this.getResults('aggregation_event_type_count', parameters, this.default_query_filters);

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

    getEventsByAffiliate(parameters){

        du.debug('Get Events By Affiliate');

        parameters = paginationutilities.mergePagination(parameters.analyticsfilter, paginationutilities.createSQLPaginationInput({limit: 10, order: 'desc'}));

        return this.getResults('events_by_affiliate', parameters, this.default_query_filters);

    }

    getTransactionsByAffiliate(parameters){

        du.debug('Get Transactions By Affiliate');

        parameters = paginationutilities.mergePagination(parameters.analyticsfilter, paginationutilities.createSQLPaginationInput({limit: 10, order: 'desc'}));

        return this.getResults('transactions_by_affiliate', parameters.analyticsfilter, this.default_query_filters);

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

    getEventFunnel(parameters){

        du.debug('Get Campaign Delta');

        return this.getResults('event_funnel', parameters.analyticsfilter, this.default_query_filters);

    }

    getActivity(args){

        du.debug('Get Activity');

        let parameters = paginationutilities.mergePagination(args.analyticsfilter, paginationutilities.createSQLPaginationInput(args.pagination));

        let filters = this.default_query_filters;

        this.activity_optional_params.forEach((optional_parameter) => {
            if (parameters[optional_parameter]) {
                filters.push(optional_parameter);
            }
        });

        return this.getResults('activity', parameters, filters);

    }

    getActivityByCustomer(args){

        let parameters = paginationutilities.mergePagination(args.analyticsfilter, paginationutilities.createSQLPaginationInput(args.pagination));

        du.debug('Get Activity By Customer', parameters);

        let params = {
            start: parameters.start,
            end: parameters.end,
            actor: [parameters.customer],
            actor_type: ['customer'],
            acted_upon: [parameters.customer],
            acted_upon_type: ['customer'],
            associated_with: [parameters.customer],
            associated_with_type: ['customer']
        };

        // return this.getActivity(params, pagination);

        params = paginationutilities.mergePagination(params, paginationutilities.createSQLPaginationInput(args.pagination));

        let filters = this.default_query_filters;

        this.activity_optional_params.forEach((optionalParam) => {
            if (params[optionalParam]) {
                filters.push(optionalParam);
            }
        });

        let or_groups = [
            ['actor', 'actor_type'],
            ['acted_upon', 'acted_upon_type'],
            ['associated_with', 'associated_with_type']

        ];

        return this.getResults('activity', params, filters, or_groups);

    }

    getAnalyticsFilter(parameters){

        if(_.has(parameters, 'analyticsfilter')){
            return parameters.analyticsfilter;
        }

        return null;

    }

}

module.exports = new AnalyticsController();

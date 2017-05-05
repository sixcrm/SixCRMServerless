'use strict';
const _ = require('underscore');
const fs = require('fs');
const Validator = require('jsonschema').Validator;

const timestamp = require('../../lib/timestamp.js');
const du = require('../../lib/debug-utilities.js');
const redshiftutilities = require('../../lib/redshift-utilities.js');
const mathutilities =  require('../../lib/math-utilities.js');

const cacheController = require('../Cache.js');

class AnalyticsController {

    constructor(){

        this.period_options = [
          {name:"minute", seconds: 60},
          {name:"hour", seconds: 3600},
          {name:"day", seconds: 86400},
          {name:"week", seconds: 604800},
          {name:"month", seconds: 2678400},
          {name:"quarter", seconds: 7776000},
          {name:"year", seconds: 30412800}
        ];

        this.period_count_default = 30;

    }

    //new
    getMerchantProcessorAmount(parameters){

        du.debug('Get Merchant Processor Amount');

        let query_filters = ['campaign','merchant_processor','affiliate','s1','s2','s3','s4','s5','account'];

        parameters = this.appendAccount(parameters);

        return this.getResults('merchant_processor_amount', parameters, query_filters);

    }

    //new
    getEventsByAffiliate(parameters){

        du.debug('Get Events By Affiliate');

        let query_filters = ['campaign','merchant_processor','affiliate','s1','s2','s3','s4','s5','account'];

        parameters = this.appendAccount(parameters);

        return this.getResults('events_by_affiliate', parameters, query_filters);

    }

    //new
    getTransactionsByAffiliate(parameters){

        du.debug('Get Transactions By Affiliate');

        let query_filters = ['campaign','merchant_processor','affiliate','s1','s2','s3','s4','s5','account'];

        parameters = this.appendAccount(parameters);

        return this.getResults('transactions_by_affiliate', parameters, query_filters);

    }

    getTransactionOverview(parameters){

        du.debug('Get Transaction Overview');

        let query_filters = ['campaign','merchant_processor','affiliate','s1','s2','s3','s4','s5','account'];

        parameters = this.appendAccount(parameters);

        return this.getResults('transaction_summary', parameters, query_filters);

    }

    getTransactionSummary(parameters){

        du.debug('Get Campaign Delta');

        let query_filters = ['campaign','merchant_processor','affiliate','s1','s2','s3','s4','s5','account'];

        let target_period_count = this.getTargetPeriodCount(parameters);

        let period_selection = this.periodSelection(parameters.start, parameters.end, target_period_count);

        parameters = this.appendPeriod(parameters, period_selection);

        parameters = this.appendAccount(parameters);

        return this.getResults('aggregation_processor_amount', parameters, query_filters);

    }

    getCampaignDelta(parameters){

        du.debug('Get Campaign Delta');

        //Technical Debt:  This should be incorporated with the parameters, I think...
        parameters.limit = 20;

        parameters = this.appendAccount(parameters);

        let query_filters = ['campaign','merchant_processor','affiliate','s1','s2','s3','s4','s5','account'];

        return this.getResults('campaign_delta', parameters, query_filters);

    }

    getEventFunnel(parameters){

        du.debug('Get Campaign Delta');

        parameters = this.appendAccount(parameters);

        let query_filters = ['campaign','merchant_processor','affiliate','s1','s2','s3','s4','s5','account'];

        return this.getResults('event_funnel', parameters, query_filters);

    }

    getTargetPeriodCount(parameters){

        if(_.has(parameters,'targetperiodcount')){

            return parameters.targetperiodcount;

        }

        return this.period_count_default;

    }

    getResults(query_name, parameters, query_filters){

        du.debug('Get Results');

        return new Promise((resolve, reject) => {

            parameters = this.createQueryFilter(parameters, query_filters);

            this.validateQueryParameters(query_name, parameters).then(() => {

                return this.getQueryString(query_name).then((query) => {

                    query = this.parseQueryParameters(query, parameters);

                    du.highlight('Query:', query);

                    let redshift_query = () => redshiftutilities.query(query, []);

                    let transformation_function = this.getTransformationFunction(query_name);

                    return cacheController.useCache(query, redshift_query)
                    .then((results) => transformation_function(results, parameters))
                    .then((transformed_results) => { return resolve(transformed_results);});

                })
              .catch((error) => {

                  return reject(error);

              });

            })
          .catch((error) => {

              return reject(error);

          });

        });

    }

    periodSelection(start, end, target_period_count){

        du.debug('Period Selection');
        du.debug('Parameters: ', start, end, target_period_count);

        let start_timestamp = timestamp.dateToTimestamp(start);
        let end_timestamp = timestamp.dateToTimestamp(end);
        let best_period = null;
        let best_period_score = null;

        this.period_options.forEach((period) => {

            let seconds_difference = (end_timestamp - start_timestamp);

            let period_seconds = period.seconds;

            let this_period_delta = Math.pow(((seconds_difference/period_seconds) - target_period_count), 2);

            if(_.isNull(best_period_score) || this_period_delta < best_period_score){

                best_period_score = this_period_delta;

                best_period = period;

            }

        });

        du.debug('Selected Period: ', best_period);

        return best_period;

    }

    createQueryFilter(parameters, filters_array){

        du.debug('Create Query Filter');

        let filter_array = [];

        filters_array.forEach((filter) => {

            if(_.has(parameters, filter)){

                filter_array.push('AND '+filter+' IN (\''+parameters[filter].join('\',\'')+'\')');

            }

        });

        du.info(filter_array);

        if(filter_array.length > 0){
            parameters['filter'] = filter_array.join(' ');
        }else{
            parameters['filter'] = ' AND 1 '
        }

        return parameters;

    }

    parseQueryParameters(query, parameters){

        du.debug('Parse Query Parameters');

        for (var parameter_name in parameters) {

            var re = new RegExp('{{'+parameter_name+'}}',"g");

            query = query.replace(re, parameters[parameter_name]);

        }

        return query;

    }

    validateQueryParameters(query_name, object){

      //Technical Debt:  Why is this necessary?
        object = JSON.parse(JSON.stringify(object));

        du.debug('Validating:', query_name+' query parameters', object);

        return new Promise((resolve, reject) => {

            return this.getQueryParameterValidationString(query_name).then((query_validation_string) => {

                var v, validation;

                du.debug(object, query_validation_string);

                try{

                    v = new Validator();

                    validation = v.validate(object, query_validation_string);

                }catch(e){

                    return reject(new Error('Unable to instantiate validator.'));

                }

                if(_.has(validation, "errors") && _.isArray(validation.errors) && validation.errors.length > 0){

                    var error = {
                        message: 'One or more validation errors occurred.',
                        issues: validation.errors.map((e) => { return e.property+' '+e.message; })
                    };

                    du.warning('Input parameters do not validate.', error);

                    return reject(error);

                }

                du.highlight('Input parameters validate.');

                return resolve(true);

            });

        });

    }

    getQueryString(query_name){

        du.debug('Get Query String');

        return new Promise((resolve, reject) => {

            let query_filepath = this.getQueryFilepath(query_name);

            du.debug('Filepath: ', query_filepath);

            fs.readFile(query_filepath, 'utf8', (error, data) => {

                if(error) { return reject(error); }

                return resolve(data);

            });

        });

    }

    getQueryParameterValidationString(query_name){

        du.debug('Get Query Parameter Validation String');

        return new Promise((resolve) => {

            let query_validation_filepath = this.getQueryParameterValidationFilepath(query_name);

            du.debug('Filepath: ', query_validation_filepath);

            let schema = require(query_validation_filepath);

            return resolve(schema);

        });

    }

    getQueryFilepath(query_name){

        du.debug('Get Query Filepath');

        return __dirname+'/queries/'+query_name+'/query.sql';

    }

    getTransformationFunctionFilepath(query_name){

        du.debug('Get Query Filepath');

        return __dirname+'/queries/'+query_name+'/transform.js';

    }

    getQueryParameterValidationFilepath(query_name){

        du.debug('Get Query Parameter Validation Filepath');

        return __dirname+'/queries/'+query_name+'/parameter_validation.json';

    }

    getTransformationFunction(query_name){

        let transformation_function_filepath = this.getTransformationFunctionFilepath(query_name);

        return require(transformation_function_filepath);

    }

    //Technical Debt:  This does not allow for multi-account filters...
    appendAccount(parameters){

        du.debug('Append Account');

        if(global.account !== '*'){

            parameters['account'] = [global.account];

        }

        return parameters;

    }

    appendPeriod(parameters, period){

        du.debug('Append Period');

        parameters['period'] = period.name;

        return parameters;

    }

}

module.exports = new AnalyticsController();

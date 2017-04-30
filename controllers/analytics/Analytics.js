'use strict';
const _ = require('underscore');
const fs = require('fs');
var Validator = require('jsonschema').Validator;

var timestamp = require('../../lib/timestamp.js');

const du = require('../../lib/debug-utilities.js');
const redshiftutilities = require('../../lib/redshift-utilities.js');

const cacheController = require('../Cache.js');

//Technical Debt:  We need a caching strategy.

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

    /*
    * Technical Debt:  Filters need to be integrated into the query
    */

    getTransactionSummary(parameters){

        du.debug('Get Transaction Summary');

        return new Promise((resolve, reject) => {

            const query_name = 'aggregation_processor_amount';

            let query_filters = ['campaign','merchant_processor','affiliate','s1','s2','s3','s4','s5','account'];

            let target_period_count = this.getTargetPeriodCount(parameters);

            let period_selection = this.periodSelection(parameters.start, parameters.end, target_period_count);

            parameters = this.appendPeriod(parameters, period_selection);

            parameters = this.appendAccount(parameters);

            parameters = this.createQueryFilter(parameters, query_filters);

            this.validateQueryParameters(query_name, parameters).then(() => {

                return this.getQueryString(query_name).then((query) => {

                    query = this.parseQueryParameters(query, parameters);

                    du.highlight('Query:', query);

                    let redshift_query = redshiftutilities.query(query, []);

                    cacheController.useCache(query, redshift_query).then((results) => {

                        du.debug(results);
                        //Technical Debt:  This is somewhat clumsy...
                        let return_object = [];

                        results.forEach((result) => {

                            let result_date_iso8601 = timestamp.convertToISO8601(result[period_selection.name].toString());

                            let match_identified = false;

                            if(return_object.length > 0){

                                for(var i = 0; i < return_object.length; i++){

                                    if(_.has(return_object[i], 'datetime') && return_object[i].datetime == result_date_iso8601){

                                        match_identified = true;

                                        return return_object[i].byprocessorresult.push({
                                            processor_result: result.processor_result.toString(),
                                            count: result.transaction_count.toString(),
                                            amount: result.sum_amount.toString()
                                        });

                                    }

                                };

                            }

                            if(match_identified == false){

                                return_object.push({
                                    datetime: result_date_iso8601,
                                    byprocessorresult: [{
                                        processor_result: result.processor_result.toString(),
                                        count: 1,
                                        amount: 1.00
                                    }]
                                });

                            }

                        });

                        du.info("Observation Count: "+return_object.length);
                        // Technical Debt: Once the query is of acceptable structure, transform structure into the following JSON structure...
                        return resolve({
                            transactions:return_object
                        });

                    });

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

    getTargetPeriodCount(parameters){

        if(_.has(parameters,'targetperiodcount')){

            return parameters.targetperiodcount;

        }

        return this.period_count_default;

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

    getQueryParameterValidationFilepath(query_name){

        du.debug('Get Query Parameter Validation Filepath');

        return __dirname+'/queries/'+query_name+'/parameter_validation.json';

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

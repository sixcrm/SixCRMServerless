'use strict';
const _ = require('underscore');
const fs = require('fs');
var Validator = require('jsonschema').Validator;

var timestamp = require('../../lib/timestamp.js');

const du = require('../../lib/debug-utilities.js');
const redshiftutilities = require('../../lib/redshift-utilities.js');

//Technical Debt:  We need a caching strategy.

class AnalyticsController {

    constructor(){

        this.period_options = [
        {name:"minute", seconds: 60},
        {name:"hour", seconds: 3600},
        {name:"day",seconds: 86400},
        {name:"week", seconds: 604800},
        {name:"month", second: 2678400},
        {name:"quarter", second: 7776000},
        {name:"year", second: 30412800}
        ];

    }

    getTransactionSummary(parameters){

        du.debug('Get Transaction Summary');

        return new Promise((resolve, reject) => {

            const query_name = 'aggregation_processor_amount';

            let period_selection = this.periodSelection(parameters.start, parameters.end, 30);

            parameters = this.appendPeriod(parameters, period_selection);

            parameters = this.appendAccount(parameters);

            this.validateQueryParameters(query_name, parameters).then((validated) => {

                this.getQueryString(query_name).then((query) => {

                    query = this.parseQueryParameters(query, parameters);

                    du.highlight('Query:', query);

                    redshiftutilities.query(query, []).then((results) => {

                        du.debug('Query Results:', results);

              // Technical Debt: Once the query is of acceptable structure, transform structure into the following JSON structure...
                        return resolve({
                            transactions:[
                                {
                                    datetime: "2017-04-20T20:57:32.802Z",
                                    byprocessorresult: [
                                        {
                                            processor_result: "success",
                                            count: 14,
                                            amount: 450.99
                                        },
                                        {
                                            processor_result: "decline",
                                            count: 2,
                                            amount: 32.98
                                        },
                                        {
                                            processor_result: "error",
                                            count: 2,
                                            amount: 32.98
                                        }
                                    ]
                                },
                                {
                                    datetime: "2017-04-21T17:41:41.117Z",
                                    byprocessorresult: [
                                        {
                                            processor_result: "success",
                                            count: 14,
                                            amount: 450.99
                                        },
                                        {
                                            processor_result: "decline",
                                            count: 2,
                                            amount: 32.98
                                        },
                                        {
                                            processor_result: "error",
                                            count: 2,
                                            amount: 32.98
                                        }
                                    ]
                                }
                            ]
                        });

                    });

                }).catch((error) => {

                    return reject(error);

                });

            });

        });

    }

    periodSelection(start, end, target_period_count){

        du.debug('Period Selection');

        let start_timestamp = timestamp.dateToTimestamp(start);
        let end_timestamp = timestamp.dateToTimestamp(end);
        let best_period = null;
        let best_period_score = null;

        this.period_options.forEach((period) => {

            let this_period_delta = Math.abs((((end_timestamp - start_timestamp)/period.seconds) - target_period_count));

            if(_.isNull(best_period_score) || this_period_delta < best_period_score){

                best_period_score = this_period_delta;

                best_period = period;

            }

        });

        du.debug('Selected Period: ', best_period);

        return best_period;

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

                du.highlight(object, query_validation_string);

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

        return new Promise((resolve, reject) => {

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

    appendAccount(parameters){

        du.debug('Append Account');

        parameters['account'] = global.account;

        return parameters;

    }

    appendPeriod(parameters, period){

        du.debug('Append Period');

        parameters['period'] = period.name;

        return parameters;

    }

}

module.exports = new AnalyticsController();

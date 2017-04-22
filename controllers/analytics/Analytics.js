'use strict';
const _ = require('underscore');
const fs = require('fs');
var validator = require('validator');
var Validator = require('jsonschema').Validator;

var timestamp = require('../../lib/timestamp.js');

const du = require('../../lib/debug-utilities.js');
const redshiftutilities = require('../../lib/redshift-utilities.js');

//Technical Debt:  We need a caching strategy.

class AnalyticsController {

    getTransactionSummary(parameters){

        return new Promise((resolve, reject) => {

        //Technical Debt: pick meaningful query based on the period (difference between the start and end date) queried.
            let query_name = 'transaction_summary';

            du.debug('Get Transaction Summary');

            this.getQueryString(query_name).then((query) => {

                parameters = this.appendAccount(parameters);

                this.validateQueryParameters(query_name, parameters).then((validated) => {

            //Technical Debt:
            //add additional validation: start and end adhere to some date format
            //assume account is a UUIDv4 and the user has access to it (graph controller assures us..., I think)

                    let ordered_parameters = [parameters.account, parameters.start, parameters.end];

                    du.highlight('Query:', query, 'Parameters:', ordered_parameters);

                    redshiftutilities.query(query, ordered_parameters).then((results) => {

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

    validateQueryParameters(query_name, object){

        du.debug('Validating:', query_name+' query parameters', object);

        return new Promise((resolve, reject) => {

            return this.getQueryParameterValidationString(query_name).then((query_validation_string) => {

                var v = new Validator();

                var validation;

                try{

                    v = new Validator();
                    validation = v.validate(object, query_validation_string);

                }catch(e){

                    return reject(new Error('Unable to instantiate validator.'));

                }

                du.info(validation);

                if(_.has(validation, "errors") && _.isArray(validation.errors) && validation.errors.length > 0){

                    var error = {
                        message: 'One or more validation errors occurred.',
                        issues: validation.errors.map((e) => { return e.message; })
                    };

                    return reject(error);

                }

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

        parameters['account'] = global.account;

        return parameters;

    }

}

module.exports = new AnalyticsController();

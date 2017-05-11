'use strict';
const _ = require('underscore');
const fs = require('fs');
const Validator = require('jsonschema').Validator;

const timestamp = require('../../lib/timestamp.js');
const du = require('../../lib/debug-utilities.js');
const redshiftutilities = require('../../lib/redshift-utilities.js');
const mathutilities =  require('../../lib/math-utilities.js');

const cacheController = require('../Cache.js');

module.exports = class AnalyticsUtilities {

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

    //Technical Debt:  Messy.  Refactor.
    getResults(query_name, parameters, query_filters){

        du.debug('Get Results');

        return new Promise((resolve, reject) => {

            parameters = this.appendAccount(parameters);

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

    getTargetPeriodCount(parameters){

        du.debug('Get Target Period Count');

        if(_.has(parameters,'targetperiodcount')){

            return parameters.targetperiodcount;

        }

        return this.period_count_default;

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

    createQueryList(parameters){

        du.debug('Create Filter List');

        du.debug(parameters);
        if(!_.isArray(parameters)){
            throw new Error('Create Filter List only supports array arguments.');
        }

        return '\''+parameters.join('\',\'')+'\'';

    }

    parseQueryParameters(query, parameters){

        du.debug('Parse Query Parameters');

        for (var parameter_name in parameters) {

            var re = new RegExp('{{'+parameter_name+'}}',"g");

            query = query.replace(re, parameters[parameter_name]);

        }

        return query;

    }

    //Technical Debt:  Refactor
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

        let query_filepath = __dirname+'/queries/'+query_name+'/query.sql';

        return query_filepath;

    }

    getTransformationFunctionFilepath(query_name){

        du.debug('Get Transformation Function Filepath');

        let transformation_function_filepath = __dirname+'/queries/'+query_name+'/transform.js';
        let default_transformation_function_filepath =  __dirname+'/queries/default/transform.js';

        if(fs.existsSync(transformation_function_filepath)){
            return transformation_function_filepath;
        }else{
            du.warning('Using default query transformation function');
            return default_transformation_function_filepath;
        }

    }

    getQueryParameterValidationFilepath(query_name){

        du.debug('Get Query Parameter Validation Filepath');

        let query_parameter_validation_filepath = __dirname+'/queries/'+query_name+'/parameter_validation.json';
        let default_query_parameter_validation_filepath = __dirname+'/queries/default/parameter_validation.json';

        if(fs.existsSync(query_parameter_validation_filepath)){
            return query_parameter_validation_filepath;
        }else{
            du.warning('Using default query parameter validation');
            return default_query_parameter_validation_filepath;
        }

    }

    getTransformationFunction(query_name){

        du.debug('Get Transformation Function');

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

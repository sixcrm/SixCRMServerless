'use strict';
const _ = require('underscore');
const fs = require('fs');
const Validator = require('jsonschema').Validator;

const timestamp = global.routes.include('lib', 'timestamp.js');
const du = global.routes.include('lib', 'debug-utilities.js');
const redshiftutilities = global.routes.include('lib', 'redshift-utilities.js');

const cacheController = global.routes.include('controllers', 'providers/Cache.js');

//Technical Debt:  Create SQL Query Builder class and abstract the query building methods there.

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

    setCacheSettings(parameters){

        du.debug('Set Cache Settings');

        if(_.has(parameters, 'cache')){

            if(_.has(parameters.cache, 'use_cache') && parameters.cache.use_cache == false){

                cacheController.setDisable(true);

            }

        }

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

        du.debug('Create Query Filter', parameters, filters_array);

        let filter_array = [];

        filters_array.forEach((filter) => {

            if (_.has(parameters, filter)) {

                du.highlight(filter, parameters[filter]);

                filter_array.push(filter+" IN ('"+parameters[filter].join("','")+"')");

            }

        });

        if(_.has(parameters, 'additional_filters') && _.isArray(parameters.additional_filters) && parameters.additional_filters.length > 0){

            filter_array = filter_array.concat(parameters.additional_filters);

            delete parameters.additional_filters;

        }

        if(filter_array.length > 0){
            parameters['filter'] = ' AND '+filter_array.join(' AND ');
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

            let replace_string = ''

            if(_.isArray(parameters[parameter_name])){

                let replace_array = [];

                parameters[parameter_name].forEach((parameter) => {

                    replace_array.push(parameter);

                });

                replace_string = '\''+replace_array.join('\',\'')+'\'';

            }else{

                replace_string = parameters[parameter_name];

            }

            query = query.replace(re, replace_string);

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

    collapseActivityFilterObject(activity_filter_object){

        let return_object = {};

        for(var key in activity_filter_object){

            return_object = this.collapseActivityFilterKey(return_object, key, activity_filter_object);

        }

        return return_object;

    }

    collapseActivityFilterKey(return_object, key, activity_filter_object){

        if(_.isArray(activity_filter_object[key]) && activity_filter_object[key].length > 0){

            return_object[key] = "'"+activity_filter_object[key].join("','")+"'";

        }else if(_.isString(activity_filter_object[key])){

            return_object[key] = activity_filter_object[key];

        }

        return return_object;

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

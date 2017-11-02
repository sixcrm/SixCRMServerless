'use strict'
const AWS = require("aws-sdk");
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const random = global.SixCRM.routes.include('lib', 'random.js');
const AWSUtilities = global.SixCRM.routes.include('lib', 'aws-utilities.js');

class DynamoDBUtilities extends AWSUtilities{

    constructor(){

      super();

      if(process.env.stage === 'local' || process.env.IS_OFFLINE) {

        du.debug('Using local dynamodb.');

        this.dynamodb = new AWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: global.SixCRM.configuration.site_config.dynamodb.endpoint
        });

        this.dynamoraw = new AWS.DynamoDB({
            region: 'localhost',
            endpoint: global.SixCRM.configuration.site_config.dynamodb.endpoint
        });

      } else {

        du.debug('Using remote dynamodb.');

        this.dynamodb = new AWS.DynamoDB.DocumentClient({
          region: global.SixCRM.configuration.site_config.aws.region
        });

        this.dynamoraw = new AWS.DynamoDB({
          region: global.SixCRM.configuration.site_config.aws.region
        });

      }

    }

    get(table, key){

      du.debug('Get');

      let parameters = {
          TableName: table,
          Key: key
      };

      return this.executeDynamoDBMethod({method: 'get', parameters: parameters});

    }

    scanRecords(table, additional_parameters){

      du.debug('Scan Records');

      var parameters = {
          TableName: table
      };

      parameters = this.translateParameters(additional_parameters, parameters);

      return this.executeDynamoDBMethod({method: 'scan', parameters: parameters});

    }

    queryRecords(table, additional_parameters, index){

      du.debug('Query Records');

      var parameters = {
          TableName: table,
          IndexName: index
      };

      parameters = this.translateParameters(additional_parameters, parameters);

      return this.executeDynamoDBMethod({method: 'query', parameters: parameters});

    }

    countRecords(table, additional_parameters, index){

      du.debug('Count Records');

      var parameters = {
          TableName: table,
          IndexName: index,
          Select: 'COUNT'
      };

      parameters = this.translateParameters(additional_parameters, parameters);

      return this.executeDynamoDBMethod({method: 'query', parameters: parameters});

    }

    saveRecord(table, item){

      du.debug('Save Record');

      item = JSON.parse(JSON.stringify(item));

      var parameters = {
          TableName:table,
          Item:item
      };

      return this.executeDynamoDBMethod({method: 'put', parameters: parameters});

    }

    updateRecord(table, key, expression, expression_params, callback){

      du.debug('Update Record');

      var parameters = {
          TableName:table,
          Key: key,
          UpdateExpression: expression,
          ExpressionAttributeValues:expression_params,
          ReturnValues:"UPDATED_NEW"
      };

      return this.executeDynamoDBMethod({method: 'update', parameters: parameters});

    }

    deleteRecord(table, key, expression, expression_parameters, callback){

      du.debug('Delete Record');

      var parameters = {
          TableName:table,
          Key: key,
          ConditionExpression: expression,
          ExpressionAttributeValues:expression_parameters
      };

      return this.executeDynamoDBMethod({method: 'delete', parameters: parameters});

    }

    createINQueryParameters(field_name, in_array){

      du.debug('Create IN Query Parameters');

      arrayutilities.nonEmpty(in_array, true);

      if(!arrayutilities.assureEntries(in_array, 'string')){
        eu.throwError('server', 'All entries in the "in_array" must be of type string.');
      }

      let in_object = {};

      arrayutilities.map(in_array, (value) => {

        //Technical Debt: convert to do,while
        var in_key = ":"+random.createRandomString(10);

        //assure uniqueness
        while(_.has(in_object, in_key)){
          in_key = ":"+random.createRandomString(10);
        }

        in_object[in_key.toString()] = value;

      });

      return {
          filter_expression : field_name+" IN ("+Object.keys(in_object).toString()+ ")",
          expression_attribute_values : in_object
      };

    }

    appendDisjunctionQueryParameters(query_parameters, field_name, array){

        du.debug('Append Disjunction Query Parameters');

        // instantiate query_parameters object if undefined, or complete if incomplete
        if (!query_parameters) {
            query_parameters = {};
        }

        if (!query_parameters.filter_expression) {
            query_parameters.filter_expression = '';
        }

        if (!query_parameters.expression_attribute_names) {
            query_parameters.expression_attribute_names = {};
        }

        if (!query_parameters.expression_attribute_values) {
            query_parameters.expression_attribute_values = {};
        }

        let expression = '';

        // append OR fragment to expression, add value for each element in array and add attribute name
        Object.keys(array).forEach(key => {
            expression += (expression ? ' OR ' : '') + `#${field_name} = :${field_name}v` + key;
            query_parameters.expression_attribute_values[`:${field_name}v` + key] = array[key];
        });

        query_parameters.filter_expression += '(' + expression + ')';
        query_parameters.expression_attribute_names['#' + field_name] = field_name;

        return query_parameters;

    }

    translateParameters(parameters, new_parameter_object){

      du.debug('Translate Parameters');

      if(_.isUndefined(new_parameter_object)){ new_parameter_object = {}; }

      let parameter_map = {
        'key_condition_expression':'KeyConditionExpression',
        'expression_attribute_values':'ExpressionAttributeValues',
        'expression_attribute_names':'ExpressionAttributeNames',
        'filter_expression':'FilterExpression',
        'limit':'Limit',
        'scan_index_forward':'ScanIndexForward',
        'ExclusiveStartKey':'ExclusiveStartKey',
        'Select': 'Select',
        'select': 'Select'
      }

      //Technical Debt:  Use objectutilities.transcribe
      objectutilities.getKeys(parameter_map).map((field) => {
        if(_.has(parameters, field) && !_.isNull(parameters[field])){
          new_parameter_object[parameter_map[field]] = parameters[field];
        }
      });

      return new_parameter_object

    }

    createTable(parameters){

      du.debug('Create Table');

      return this.executeDynamoDBMethod({method: 'createTable', parameters: parameters});

    }

    updateTable(parameters){

      du.debug('Update Table');

      return this.executeDynamoDBMethod({method: 'updateTable', parameters: parameters});

    }

    describeTable(parameters, fatal) {

      du.debug('Describe Table');

      if(_.isString(parameters)){
        parameters = {
          TableName:parameters
        };
      }

      return this.executeDynamoDBMethod({method: 'describeTable', parameters: parameters, fatal: fatal});

    }

    deleteTable(parameters){

      du.debug('Delete Table');

      if(_.isString(parameters)){
        parameters = {
          TableName:parameters
        };
      }

      return this.executeDynamoDBMethod({method: 'deleteTable', parameters: parameters});

    }

    waitFor(parameters, status){

      du.debug('Wait For');

      if(_.isString(parameters)){
        parameters = {
          TableName:parameters
        };
      }

      return this.executeDynamoDBMethod({method: 'waitFor', status: status, parameters: parameters});

    }

    executeDynamoDBMethod({method, parameters, status, fatal}){

      du.debug('Execute Dynamo DB Method');

      du.debug('Method: '+method);

      fatal = (_.isUndefined(fatal))?true:fatal;

      let valid_methods = {
        document_client: ['get', 'scan', 'query', 'put', 'update', 'delete'],
        raw: ['waitFor', 'deleteTable', 'describeTable', 'updateTable', 'createTable']
      }

      if(_.contains(valid_methods.document_client, method)){

        return new Promise((resolve, reject) => {

          du.debug('DynamoDB Parameters (last hop):', parameters);

          this.dynamodb[method](parameters, (error, data) => {

            if(error){
              if(fatal){
                eu.throwError('server', error);
              }
              return reject(error);
            }

            return resolve(data);

          });

        });

      }

      if(_.contains(valid_methods.raw, method)){

        return new Promise((resolve, reject) => {

          if(method == 'waitFor'){

            du.debug('DynamoDB Parameters (last hop):', parameters);

            this.dynamoraw[method](status, parameters, (error, data) => {

              if(_.isError(error)){
                if(fatal){
                  eu.throwError('server', error);
                }
                return reject(error);
              }

              return resolve(data);

            });

          }else{

            du.debug('DynamoDB Parameters (last hop):', parameters);

            this.dynamoraw[method](parameters, (error, data) => {

              if(_.isError(error)){
                if(fatal){
                  eu.throwError('server', error);
                }
                return reject(error);
              }

              return resolve(data);

            });

          }

        });

      }

      eu.throwError('server', 'Unknown method: '+method);

    }

}

module.exports = new DynamoDBUtilities();

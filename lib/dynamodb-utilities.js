'use strict'
const AWS = require("aws-sdk");
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

class DynamoDBUtilities {

    constructor(){

        if(process.env.stage === 'local' || process.env.IS_OFFLINE) {

            du.debug('Using local dynamodb.');

            this.dynamodb = new AWS.DynamoDB.DocumentClient({
                region: 'localhost',
                endpoint: global.SixCRM.configuration.site_config.dynamodb.endpoint
            });

            this.dynamoraw = new AWS.DynamoDB({
                region: 'localhost',
                endpoint:global.SixCRM.configuration.site_config.dynamodb.endpoint
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

    /**
     * Get entity by key.
     */
    get(table, key, callback){

        du.debug('Get');

        let params = {
            TableName: table,
            Key: key
        };

        du.debug('Get entity by key', params);

        this.dynamodb.get(params, function(err, data) {
            if (err){
                callback(err, err.stack);
            }else{
                callback(null, data);
            }
        });

    }


	//ACL enabled
    scanRecords(table, parameters, callback){

        du.debug('Scan Records');

        var params = {
            TableName: table
        };

        params = this.translateParameters(parameters, params);

        this.dynamodb.scan(params, function(err, data) {
            if(_.isError(err)){
                return callback(err, err.stack);
            }

            if(_.isObject(data) && _.has(data, "Items") && _.isArray(data.Items)){
                return callback(null, data.Items);
            }

        });

    }

	//ACL enabled
    scanRecordsFull(table, parameters, callback){

        du.debug('Scan Records Full');

        var params = {
            TableName: table
        };

        params = this.translateParameters(parameters, params);

        du.debug('Query Parameters (last hop)', params);

        this.dynamodb.scan(params, function(err, data) {

            if(_.isError(err)){
                return callback(err, err.stack);
            }

            callback(null, data);

        });

    }

	   //ACL enabled
    queryRecords(table, parameters, index, callback){

        du.debug('Query Records');

        var params = {
            TableName: table,
            IndexName: index
        };

        params = this.translateParameters(parameters, params);

        du.debug('Query Parameters (last hop)', params);

        this.dynamodb.query(params, function(err, data) {

            if(_.isError(err)){

                return callback(err, err.stack);

            }

            if(_.isObject(data) && _.has(data, "Items") && _.isArray(data.Items)){
                return callback(null, data.Items);
            }

        });

    }

    queryRecordsFull(table, parameters, index, callback){

        du.debug('Query Records Full');

        var params = {
            TableName: table,
            IndexName: index
        };

        params = this.translateParameters(parameters, params);

        du.debug('Query Parameters (last hop)', params);

        this.dynamodb.query(params, function(err, data) {

            if(_.isError(err)){

				        //callback is not a function?
                return callback(err, err.stack);

            }

            return callback(null, data);

        });

    }

    //ACL enabled
    countRecords(table, parameters, index, callback){

        du.debug('Count Records');

        var params = {
            TableName: table,
            IndexName: index,
            Select: 'COUNT'
        };

        params = this.translateParameters(parameters, params);

        du.debug('Count Parameters (last hop)', params);

        this.dynamodb.query(params, function(err, data) {


            if(_.isError(err)){

                du.warning(params);
                //callback is not a function?
                return callback(err, err.stack);

            }

            if(_.isObject(data) && _.has(data, "Count") && _.isNumber(data.Count)){
                return callback(null, data.Count);
            }

        });

    }

	//ACL enabled
    saveRecord(table, item, callback){

        du.debug('Save Record');

        item = JSON.parse(JSON.stringify(item));

        var params = {
            TableName:table,
            Item:item
        };

        this.dynamodb.put(params, function(err, data) {
    		  if(_.isError(err)){ callback(err, err.stack); }
    		  callback(null, data);
        });

    }

	//ACL enabled
	//Technical Debt:  might need to update this for reserved keywords
    updateRecord(table, key, expression, expression_params, callback){

        du.debug('Update Record');

        var params = {
            TableName:table,
            Key: key,
            UpdateExpression: expression,
            ExpressionAttributeValues:expression_params,
            ReturnValues:"UPDATED_NEW"
        };

        this.dynamodb.update(params, function(err, data) {
    		  if (err){
    			 callback(err, err.stack);
    		  }else{
          callback(null, data);
    		  }
        });

    }

	//ACL enabled
	//Technical Debt:  might need to update this for reserved keywords
    deleteRecord(table, key, expression, expression_params, callback){

        du.debug('Delete Record');

        var params = {
            TableName:table,
            Key: key,
            ConditionExpression: expression,
            ExpressionAttributeValues:expression_params
        };

        this.dynamodb.delete(params, function(err, data) {
    		  if (err){
    			 callback(err, err.stack);
    		  }else{
          callback(null, data);
    		  }
        });

    }

    deleteTable(table, callback){

        du.debug('Delete Table');

        var params = {
            TableName:table
        };

        this.dynamoraw.deleteTable(params, function(err, data) {
            if (err){
                callback(err, err.stack);
            }else{
                callback(null, data);
            }
        });

    }

    describeTable(table, callback) {

        du.debug('Describle Table');

        var params = {
            TableName:table
        };

        this.dynamoraw.describeTable(params, callback);
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
          'ExclusiveStartKey':'ExclusiveStartKey'
        }

        objectutilities.getKeys(parameter_map).map((field) => {
          if(_.has(parameters, field) && !_.isNull(parameters[field])){
            new_parameter_object[parameter_map[field]] = parameters[field];
          }
        });

        return new_parameter_object

    }

}

module.exports = new DynamoDBUtilities();

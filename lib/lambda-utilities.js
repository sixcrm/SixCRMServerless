'use strict'
const AWS = require("aws-sdk");
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const parserutilities = global.SixCRM.routes.include('lib', 'parser-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

class LambdaUtilities {

    constructor(stage){

      var parameters = {apiVersion: '2015-03-31', region: 'us-east-1'};

      if(stage == 'local'){

        parameters.region = 'us-east-1';
        parameters.endpoint = process.env.lambda_endpoint;

      }

      this.lambda = new AWS.Lambda(parameters);

      this.lambda_name_template = '{{service}}-{{stage}}-{{shortname}}';

    }

    buildLambdaName(shortname){

      du.debug('Build Lambda Name');

      if(!objectutilities.hasRecursive(global, 'SixCRM.configuration.serverless_config.service')){
        eu.throwError('server', 'Unavailable service name in serverless configuration object');
      }

      if(!objectutilities.hasRecursive(process, 'env.stage')){
        eu.throwError('server', 'Unavailable environment stage in process');
      }

      let name_parameters = {
        service: global.SixCRM.configuration.serverless_config.service,
        stage: process.env.stage,
        shortname: shortname
      };

      return parserutilities.parse(this.lambda_name_template, name_parameters);

    }

    buildHandlerFunctionName(longname) {
        du.debug('Build Handler Function Name');

        return longname.replace(/.+-.+-/, ''); // strip out canonical part 'sixcrm-stagename-';
    }

    invokeFunction(parameters, callback){

      du.debug('Invoke Function');

      return new Promise((resolve, reject) => {

        var params = {
          FunctionName: parameters.function_name,
          Payload: parameters.payload,
          InvocationType: parameters.invocation_type || 'RequestResponse',
          LogType: 'Tail'
        };

        if (process.env.require_local) {

          return this.invokeLocal(params, callback);

        } else {

          this.lambda.invoke(params, (error, data) => {

            if (error) {

              du.error(error);
              return reject(error);

            }

            return resolve(data);

          });

        }

      });

    }

    invokeLocal(parameters, callback) {
        du.debug('Invoke Local');

        if (!callback) {
            callback = () => true;
        }

        let function_name = this.buildHandlerFunctionName(parameters.FunctionName);
        let lambda = this.getLambdaInstance(function_name);

        return new Promise((resolve, reject) => {

            // Parameters of every lambda are:
            // 1. serialized event,
            // 2. context,
            // 3. callback to execute with the response
            let serialized_payload = JSON.parse(parameters.Payload);
            let context = {}; // local execution, empty context seems OK
            let lambda_callback = (error, data) => {

                du.debug('Inside lambda callback.', error, data);

                if (error) {
                    return reject(callback(error));
                }

                if (data.body && data.body.success && data.body.success === false) {
                    return reject(callback(error));
                }

                // AWS Lambda JS SKD does this for us, but when executing locally we need to wrap the response into
                // an object ourselves and execute the main callback manually.
                return resolve(callback(null, {
                    StatusCode: 200,
                    Payload: data
                }));
            };

            // Finally, we execute the function.
            du.debug('Executing Lambda locally', function_name, serialized_payload);

            lambda[function_name](serialized_payload, context, lambda_callback);
        });
    }

    getLambdaInstance(lambda_name) {
        let lambda = global.SixCRM.configuration.serverless_config.functions[lambda_name];
        let handler = lambda.handler.replace(/\.[^/.]+$/, '') ; // strip function name from path, i.e. 'handler.billtohold'

        let path = global.SixCRM.routes.root + '/' + handler;

        if (lambda.environment) {
            for (let key in lambda.environment) {
                process.env[key] = lambda.environment[key];
            }
        }

        delete require.cache[require.resolve(path)];
        return require(path);
    }

}

var lambda = new LambdaUtilities(process.env.stage);

module.exports = lambda;

'use strict'
const _ = require('underscore');
const serverless = require('serverless');
const du = global.routes.include('lib', 'debug-utilities.js');
const eu = global.routes.include('lib', 'error-utilities.js');

du.output(serverless);


//Technical Debt: Finish this.
class ServerlessUtilities {

    static loadConfig(stage, handler){

        let serverless_config = global.routes.include('root','serverless.yml');

        if(!_.has(serverless_config, 'functions') || !_.has(serverless_config.functions, handler)){
            eu.throwError('server','The function "'+handler+'" is not defined in the serverless.yml file.');
        }

        let function_config = serverless_config.functions[handler];

        if(_.has(function_config, 'environment')){

            for(var k in function_config.environment){

                du.debug(k, function_config.environment[k]);

            }

        }

    }

}

module.exports = ServerlessUtilities;

'use strict';

const _ = require("underscore");
const du = require('../../lib/debug-utilities.js');

module.exports = class endpointController {
	
	constructor(){

	}
	
	preprocessing(event){
	
		return this.parseEvent(event).then(this.acquireAccount).then(this.setGlobalAccount);
	
	}
	
	parseEvent(event){
		
		du.debug('Parse Event');
		
		if(!_.isObject(event)){

			event = JSON.parse(event.replace(/[\n\r\t]+/g, ''));

		}

		if(_.has(event, 'requestContext') && !_.isObject(event.requestContext)){

			event.requestContext = JSON.parse(event.requestContext);

		}

		if(_.has(event, 'pathParameters') && !_.isObject(event.pathParameters)){

			event.pathParameters = JSON.parse(event.pathParameters);

		}

		return Promise.resolve(event);

	}
	
	acquireAccount(event){
		
		var pathParameters;

		if(_.isObject(event) && _.has(event, "pathParameters")){

			pathParameters = event.pathParameters;

		}

		if(_.isObject(pathParameters) && _.has(pathParameters, 'account')){

			event.account = pathParameters.account;

		}else if(_.isString(pathParameters)){

			pathParameters = JSON.parse(pathParameters);

			if(_.isObject(pathParameters) && _.has(pathParameters, 'account')){

				event.account = pathParameters.account;

			}

		}

		return Promise.resolve(event);
			
	}
	
	setGlobalAccount(event){
		
		du.debug('Set Global Account');
		
		if(_.has(event, 'account')){

			global.account = event.account;

		}

		return Promise.resolve(event);
			
	}
	
}
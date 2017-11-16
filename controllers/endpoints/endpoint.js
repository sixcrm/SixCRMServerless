'use strict';
const _ = require("underscore");
const querystring = require('querystring');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');

module.exports = class EndpointController {

  constructor(){

      this.clearState();

  }

  clearState(){

      du.debug('Clear State');

      this.pathParameters = undefined;
      this.queryString = undefined;

  }

  acquireBody(event){

    du.debug('Acquire Body');

    if(!_.has(event, 'body')){
      this.throwUnexpectedEventStructureError();
    }

    let duplicate_body;

    try {
        duplicate_body = JSON.parse(event.body);
    } catch (e) {
        duplicate_body = event.body;
    }

    return Promise.resolve(duplicate_body);

  }

  acquirePathParameters(event){

    du.debug('Acquire Path Parameters');

    if(_.has(event, 'pathParameters')){

        this.pathParameters = event.pathParameters;

        return Promise.resolve(event);

    }else{

        this.pathParameters = undefined;

    }

    this.throwUnexpectedEventStructureError();

  }

  validateEvent(event){

    du.debug('Validate Event');

    if(!mvu.validateModel(event, global.SixCRM.routes.path('model', 'general/lambda/event.json'), null, false)){
      this.throwUnexpectedEventStructureError();
    }

    return Promise.resolve(event);

  }


  parseEvent(event){

    du.debug('Parse Event');

    if(!_.isObject(event)){

      try{

        event = JSON.parse(event.replace(/[\n\r\t]+/g, ''));

        return this.parseEvent(event);

      }catch(error){

        du.error(error);

        this.throwUnexpectedEventStructureError();

      }

    }

    if(!_.isObject(event.requestContext)){

      try{

        event.requestContext = JSON.parse(event.requestContext);

        return this.parseEvent(event);

      }catch(error){

        du.error(error);

        this.throwUnexpectedEventStructureError();

      }

    }

    if(!_.isObject(event.pathParameters)){

      try{

        event.pathParameters = JSON.parse(event.pathParameters);

        return this.parseEvent(event);

      }catch(error){

        du.error(error);

        this.throwUnexpectedEventStructureError();

      }

    }

    return Promise.resolve(event);

  }

  parseEventQueryString(event){

    du.debug('Parse Event Query String');

    if(_.has(event, 'queryStringParameters') && !_.isObject(event.queryStringParameters)){

      try{

        event.queryStringParameters = querystring.parse(event.queryStringParameters);

        return this.parseEventQueryString(event);

      }catch(error){

        du.error(error);

        this.throwUnexpectedEventStructureError();

      }

    }

    return Promise.resolve(event);

  }

  throwUnexpectedEventStructureError(){

    du.debug('Throw Unexpected Event Structure Error');

    eu.throwError('bad_request', 'Unexpected event structure.');

  }

}

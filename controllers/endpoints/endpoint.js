'use strict';
const _ = require("underscore");
const querystring = require('querystring');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');

module.exports = class EndpointController {

  constructor(){

      this.clearState();

  }

  normalizeEvent(event){

    du.debug('Normalize Event');

    let normalized = event;

    try{
      normalized = JSON.parse(event);
    }catch(error){
      //do nothing
    }

    return Promise.resolve(normalized);

  }

  //Technical Debt:  This is gross.  Refactor!
  clearState(){

    du.debug('Clear State');

    this.pathParameters = undefined;
    this.queryString = undefined;

  }

  acquireBody(event){

    du.debug('Acquire Body');

    if(!_.has(event, 'body')){
      this.throwUnexpectedEventStructureError(event);
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

    this.throwUnexpectedEventStructureError(event);

  }

  validateEvent(event){

    du.debug('Validate Event');

    //mvu.validateModel(event, global.SixCRM.routes.path('model', 'general/lambda/event.json'));

    let valid = false;

    try{
      mvu.validateModel(event, global.SixCRM.routes.path('model', 'general/lambda/event.json'));
      valid = true;
    }catch(error){
      du.error(error);
      this.throwUnexpectedEventStructureError(event);
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

        this.throwUnexpectedEventStructureError(event);

      }

    }

    return Promise.resolve(event);

  }

  throwUnexpectedEventStructureError(event){

    du.debug('Throw Unexpected Event Structure Error');

    du.warning(event);

    eu.throwError('bad_request', 'Unexpected event structure.');

  }

}

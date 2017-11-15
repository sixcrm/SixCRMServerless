'use strict'
const _ = require('underscore');
const request = require('sync-request');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
//const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
//const slackutilities = global.SixCRM.routes.include('lib', 'slack-utilities.js');

module.exports = new class ErrorUtilities {

    constructor(){

      this.error_codes = {
        403: 'forbidden',
        501: 'not_implemented',
        404: 'not_found',
        500: 'server',
        400: 'bad_request'
      };

      //Note:  Graph is dumb and needs the error names to match the error class names
      this.error_types  = {
        'forbidden':class ForbiddenError extends Error {
            constructor(message){
                super(message);
                this.name = 'Forbidden Error';
                this.message = '[403] User is not authorized to perform this action.';
                this.code = 403;
                this.someotherfield = 403;
            }
      },
          'not_implemented': class NotImplementedError extends Error {
              constructor(message){
                  super(message);
                  this.name = 'Not Implemented Error';
                  this.message = '[501] Not Implemented.';
                  this.code = 501;
              }
      },
          'not_found': class NotFoundError extends Error {
              constructor(message){
                  super(message);
                  this.name = 'Not Found Error';
                  this.message = '[404] Not found.';
                  this.code = 404;
              }
      },
          'server': class ServerError extends Error {
              constructor(message){
                  super(message);
                  this.name = 'Server Error';
                  this.message = '[500] Internal Server Error';
                  this.code = 500;
              }
      },
          'bad_request':class BadRequestError extends Error {
              constructor(message){
                  super(message);
                  this.name = 'Bad Request Error';
                  this.message = '[400] Bad Request Error';
                  this.code = 400;
              }
      },
          'validation':class ValidationError extends Error {
              constructor(message){
                  super(message);
                  this.name = 'Validation Error';
                  this.message = '[500] Validation failed.';
                  this.code = 500;
              }
      },
      };
    }

    /*
    handleError(error){

      if(_.isError(error)){

        if(_.has(error, 'code')){

           let type = this.getErrorTypeFromCode(error.code);
           this.throwError(type, error);

        }

      }

      this.throwError('server', 'Unknown error type: '+error);

    }

    getErrorTypeFromCode(code){

      let type = 'server';

      try{
        type = this.error_types[code];
      }catch(error){}

      return type;

    }
    */

    throw(error){

      throw error;

    }

    throwError(type, message, additional_properties){

        if(_.isUndefined(type)){
            type = 'server';
        }

        if(_.isError(message) && _.has(message, 'message')){

          if(!_.isFunction(du.error)){

            let adieu = global.SixCRM.routes.include('lib', 'debug-utilities.js');

            adieu.error(message);

          }else{

            du.error(message);

          }

          message = message.message.replace(/^\[\d{3}\]\s/g, "");

        }

        let an_error = this.getError(type, message, additional_properties);

        //this.sendSlackNotification(an_error);

        this.throw(an_error);

    }

    sendSlackNotification(error){

      if(_.has(error, 'code') && parseInt(error.code) >= 500 && global.SixCRM.configuration.stage !== 'local'){

        let message = this.createSlackMessageFromError(error);

        let slack_channel_webhook = this.getSlackErrorChannelWebhook();

        return request('POST', slack_channel_webhook, { json: { "text": message } });

      }

    }

    getSlackErrorChannelWebhook(){

      let channels = global.SixCRM.configuration.site_config.slack.channels;

      //Note:  Cannot use array-utilities here: array-utilities uses error-utilities.
      let error_channel = channels.find((channel) => {
        return (_.has(channel, 'channel') && channel.channel == '#servererrors');
      });

      if(_.has(error_channel, 'webhook_url')){
        return error_channel.webhook_url;
      }

      return null;

    }

    createSlackMessageFromError(error){

      return [
        '*Environment:* '+global.SixCRM.configuration.stage,
        '*Error:* ```'+error.toString()+'```',
        '```'+error.stack+'```'
      ].join("\n");

    }

    getError(type, message, additional_properties){

        let error = this.getErrorType(type)

        if(!_.isUndefined(message)){

          error.message = '['+error.code+'] '+message;

        }

        if(!_.isUndefined(additional_properties) && _.isObject(additional_properties)){
            for(var key in additional_properties){
                error[key] = additional_properties[key];
            }
        }

        return error;

    }

    getErrorType(type){

        let e = new this.error_types['server'];

        if(_.has(this.error_types, type)){

            let e = new this.error_types[type];

            return e;

        }

        return e;

    }

    getErrorByName(name){

      for (var key in this.error_types) {

        let function_name = this.removeNonAlphaNumeric(this.error_types[key].name).toLowerCase();

        let graph_name = this.removeNonAlphaNumeric(name).toLowerCase();

        if(function_name == graph_name){

          return new this.error_types[key];

        }

      }

      return null;

    }

    removeNonAlphaNumeric(string){

      return string.replace(/[^0-9a-z]/gi,'');

    }

}

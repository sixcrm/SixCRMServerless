'use strict'
const _ = require("underscore");

var timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
var signature = global.SixCRM.routes.include('lib', 'signature.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

const accessKeyController = global.SixCRM.routes.include('controllers', 'entities/AccessKey.js');

class verifySignatureController {

  execute(event){

    return this.parseEventSignature(event)
    .then(this.createTokenObject)
    .then(this.verifyTimestamp)
    .then(this.verifySignature)
    .then(this.populateAuthorityUser);

  }

 	parseEventSignature(event){

    du.debug('Parse Event Signature');

    var tokens = event.authorizationToken.split(':');

    if(!_.isArray(tokens) || !(tokens.length == 3)){

     du.warning('Signature failed:  Incorrect structure');

     return Promise.reject(false);

    }

    return Promise.resolve(tokens);

 	}

 	createTokenObject(tokens){

     du.debug('Create Token Object');

     return new Promise((resolve, reject) =>	{

       accessKeyController.disableACLs();
       accessKeyController.getAccessKeyByKey(tokens[0]).then((access_key) => {
         accessKeyController.enableACLs();

         if(_.has(access_key, 'secret_key') && _.has(access_key, 'id')){

           let token_object = {
               access_key: access_key,
               timestamp: tokens[1],
               signature: tokens[2]
           };

           return resolve(token_object);

         }else{

           return reject(eu.getError('not_implemented', 'Unset Access Key properties.'));

         }

       }).catch((error) => {

         return reject(error);

       });

     });

 	}


    verifyTimestamp(token_object){

      du.debug('Verify Timestamp');

      let time_difference = timestamp.getTimeDifference(token_object.timestamp);

      if(time_difference > (60 * 60 * 5)){

          du.warning('Signature failed:  Timestamp expired');

          return Promise.reject(false);

      }

      du.info('Timestamp valid');

      return Promise.resolve(token_object);

    }

    verifySignature(token_object){

        du.debug('Verify Signature');
        //
        if(!signature.validateSignature(token_object.access_key.secret_key, token_object.timestamp, token_object.signature)){

            du.warning('Signature failed:  Incorrect Signature');

            return Promise.reject(false);

        }else{

          du.info('Signature valid');

          return Promise.resolve(token_object);

        }

    }

    populateAuthorityUser(){

      du.debug('Populate Authority User');

      return {id: 'system@sixcrm.com'};

    }

}

module.exports = new verifySignatureController();

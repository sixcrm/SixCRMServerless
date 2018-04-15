
const _ =  require('underscore');
const request = require('request');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

module.exports = class SlackProvider {

    //Technical Debt:  This needs to be configured.
    constructor(){
        this.basepath = 'https://hooks.slack.com/services/';
        this.channels = {
            adminsixcrmdotcom: {
                path: 'T0HFP0FD5/B4F1KKKK5/kckMuyS88DifAqdHFljD1qCI',
                name: 'Admin Six CRM dot com'
            }
        };
    }

    sendMessage(message, channel){

        du.debug('Slack::sendMessage '+message+' being sent to channel '+channel);

        return new Promise((resolve, reject) => {

            let endpoint = this.basepath;

            if(_.has(this.channels, channel)){

                endpoint += this.channels[channel].path;

            }else{

                return reject(eu.getError('validation','Undefined channel: '+channel));

            }

            //Technical Debt: Use httpprovider
            request.post(endpoint, { json: { "text": message } }, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    du.debug(body);
                    return resolve(body);
                }else{
                    du.debug(error);
                    return reject(error);
                }
            });

        });

    }

    formatMessage(message){

      du.debug('Format Message');

      if(_.isString(message)){
        return {
          json: {
            "text": message
          }
        };
      }else if(_.isObject(message)){
        return message;
      }

      eu.throwError('server', 'Unknown message format: '+message);
    }

    sendMessageToWebhook(message, webhook) {

        du.debug('Send Message to Webhook');

        //let formatted_message = this.formatMessage(message);

        return new Promise((resolve, reject) => {

          //convert to HTTP utilities.

            request.post(webhook, { json: { "text": message } }, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    du.debug(body);
                    return resolve(body);
                }else{
                    du.debug(error);
                    return reject(error);
                }
            });

        });

    }

}

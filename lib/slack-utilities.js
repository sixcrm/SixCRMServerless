'use strict'
const _ =  require('underscore');
const request = require('request');
const du = global.routes.include('lib', 'debug-utilities.js');

class SlackUtilities {

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

                return reject(new Error('Undefined channel: '+channel));

            }

            du.debug(endpoint);

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

    sendMessageToWebhook(message, webhook) {

        du.debug(`Slack::sendMessageToWebhook '${message}' being sent to webhook '${webhook}'.`);

        return new Promise((resolve, reject) => {

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

var su = new SlackUtilities();

module.exports = su;

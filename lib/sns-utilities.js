'use strict';
const AWS = require("aws-sdk");
const _ = require('underscore');
const du = global.routes.include('lib', 'debug-utilities.js');

class SNSUtilities {

    constructor(){

        var parameters = {apiVersion: 'latest', region: 'us-east-1'};

        this.sns = new AWS.SNS(parameters);

    }

    sendSMS(text, phone_number) {

        return new Promise((resolve, reject) => {
            let params = {
                Message: text,
                PhoneNumber: phone_number,
            };

            du.debug('Sending SMS message with parameters', params);

            this.sns.publish(params, (error, data) => {
                if (error) {
                    du.debug('SNS Error!', error);

                    return reject(error);
                }

                if (data) {
                    du.debug('SNS Success:', data);

                    return resolve(data);
                }
            });
        });

    }

}

var sns = new SNSUtilities(process.env.stage);

module.exports = sns;

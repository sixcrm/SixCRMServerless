
const request = require('request');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const parserutilities = global.SixCRM.routes.include('lib', 'parser-utilities.js');

module.exports = class PostbackProvider {

    constructor(){

    }

    executePostback(url, data){

        du.debug('Execute Postback');

        let parsed_url = parserutilities.parse(url, data);

        return this.executeRequest(parsed_url);

    }

    executeRequest(parsed_url){

        du.debug('Execute Request');

        return new Promise((resolve, reject) => {

            var request_options = {
                url: parsed_url
            };

            request.get(request_options, (error, response) => {

                if(error){ return reject(error); }

                return resolve(response);

            });

        });

    }

}


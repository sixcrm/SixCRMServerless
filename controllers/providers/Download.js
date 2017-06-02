'use strict';
const _ = require('underscore');

const du = global.routes.include('lib', 'debug-utilities.js');
const LambdaResponse = global.routes.include('lib', 'lambda-response.js');

class DownloadController {

    constructor(){

        this.download_parameters = {};
        this.available_types = ['json'];
        this.lambdaResponse = new LambdaResponse();

    }

    resolveDownload(parameters, data_acquisition_function){

        du.debug('Resolve Download');

        this.setDownloadParameters(parameters);

        return data_acquisition_function().then((data) => {

            let transformed_data = this.transformData(data);

            this.setDownloadHeaders(transformed_data);

            return transformed_data;

        });

    }

    setDownloadHeaders(transformed_data){

        du.debug('Set Download Headers');

        let response_headers = {};

        if(this.download_parameters.type == 'json'){

            let content_length = this.calculateContentLength(transformed_data);

            response_headers['Content-Description'] = 'File Transfer';
            response_headers['Cache-Control'] = 'must-revalidate, post-check=0, pre-check=0';
            response_headers['Pragma'] = 'public';
            response_headers['Content-Type'] = 'application/octet-stream';
            response_headers['Content-Disposition'] = 'attachment;filename=awdawdawd.json';
            response_headers['Content-Transfer-Encoding'] = 'binary';
            response_headers['Connection'] = 'Keep-Alive';
            response_headers['Expires'] = '0';
            response_headers['Content-Length'] = content_length.toString();

        }

        this.lambdaResponse.setGlobalHeaders(response_headers);

    }

    calculateContentLength(content){

        du.debug('Calculate Content Length');

        return Buffer.byteLength(content.toString(), 'utf8');

    }

    setDownloadParameters(parameters){

        du.debug('Set Download Parameters');

        if(!_.isObject(parameters)){
            throw new Error('Invalid download parameter type.');
        }

        if(!_.has(parameters, 'type')){
            throw new Error('Download parameters missing type field.');
        }

        if(!_.contains(this.available_types, parameters.type)){
            throw new Error('Download type is not supported.');
        }

        this.download_parameters = parameters;

    }

    transformData(data){

        du.debug('Transform Data');

        switch(this.download_parameters.type){

        case 'json':
            return JSON.stringify(data);
        case 'csv':
        default:
            return data;

        }

    }

}

module.exports = new DownloadController();

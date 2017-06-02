'use strict';

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

        switch(this.download_parameters.type){
        case 'json':

            response_headers['Content-Type'] = 'application/octet-stream';
            response_headers['Content-Disposition'] = 'attachment;filename=awdawdawd.json';

            break;

        case 'csv':

            response_headers['Content-Type'] = 'application/octet-stream';
            response_headers['Content-Disposition'] = 'attachment;filename=awdawdawd.json';

            break;

        default:

            break;

        }

        this.lambdaResponse.setGlobalHeaders(response_headers);

    }

    setDownloadParameters(parameters){

        du.debug('Set Download Parameters');

      //Technical Debt:  Do some validation here...

        this.download_parameters = parameters;

    }

    transformData(data){

        du.debug('Transform Data');

        switch(this.download_parameters.type){

        case 'json':
            return data;
        case 'csv':
        default:
            return data;

        }

    }

}

module.exports = new DownloadController();

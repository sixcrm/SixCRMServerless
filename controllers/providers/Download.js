'use strict';
const _ = require('underscore');
const j2csv = require('json2csv');
var XLSX = require('xlsx');

const du = global.routes.include('lib', 'debug-utilities.js');
const randomutilities = global.routes.include('lib', 'random.js');
const LambdaResponse = global.routes.include('lib', 'lambda-response.js');
const objectutilities = global.routes.include('lib', 'object-utilities.js');

class DownloadController {

    constructor(){

        this.download_parameters = {};
        this.available_types = ['json', 'csv', 'excel'];
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

        let content_length = this.calculateContentLength(transformed_data);

        let filename = this.createFileName();

        response_headers['Content-Description'] = 'File Transfer';
        response_headers['Cache-Control'] = 'must-revalidate, post-check=0, pre-check=0';
        response_headers['Pragma'] = 'public';
        response_headers['Content-Type'] = 'application/octet-stream';
        response_headers['Content-Transfer-Encoding'] = 'binary';
        response_headers['Connection'] = 'Keep-Alive';
        response_headers['Expires'] = '0';
        response_headers['Content-Length'] = content_length.toString();
        response_headers['Content-Disposition'] = 'attachment;filename='+filename;

        this.lambdaResponse.setGlobalHeaders(response_headers);

    }

    createFileName(){

        du.debug('Create File Name');

        let name = randomutilities.createRandomString(10).toLowerCase();
        let extension = this.getFileExtension();

        return name+extension;

    }

    getFileExtension(){

        du.debug('Get File Extension');

        if(this.download_parameters.type == 'json'){
            return '.json';
        }else if(this.download_parameters.type == 'csv'){
            return '.csv';
        }else if(this.download_parameters.type == 'excel'){
            return '.xlsx';
        }

        return '.txt';

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

        if(this.download_parameters.type == 'json'){

            return JSON.stringify(data);

        }else if(this.download_parameters.type == 'csv'){

            return this.JSONToCSV(data);

        }else if(this.download_parameters.type == 'excel'){

            return this.JSONToExcel(data);

        }

        return data;

    }

    recurseForArray(data){

        du.debug('Recurse For Data');

        let discovered_data = objectutilities.orderedRecursion(data, function(thing){

            return _.isArray(thing);

        });

        if(_.isNull(discovered_data)){

            du.warning('Unable to identify suitable discovered_data.');

        }

        return discovered_data;

    }

    JSONToCSV(data){

        du.debug('JSON to CSV');

        let data_array = this.recurseForArray(data);

        if(_.isNull(data_array)){

            data_array = data;

        }

        return j2csv({data: data_array});

    }

    JSONToExcel(data){

        du.debug('JSON To Excel');

        let data_array = this.recurseForArray(data);

        if(_.isNull(data_array)){

            data_array = [data];

        }

        var ws = XLSX.utils.json_to_sheet(JSON.parse(JSON.stringify(data_array)));

        return ws;

    }

}

module.exports = new DownloadController();


const _ = require('lodash');
const j2csv = require('json2csv');
var XLSX = require('xlsx');

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;

const randomutilities = require('@6crm/sixcrmcore/util/random').default;
const LambdaResponse = global.SixCRM.routes.include('controllers', 'providers/lambda-response.js');
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;

module.exports = class DownloadController {

	constructor(){

		this.download_parameters = {};
		this.available_types = ['json', 'csv', 'excel'];
		this.lambdaResponse = new LambdaResponse();

	}

	resolveDownload(parameters, data_acquisition_function){
		this.setDownloadParameters(parameters);

		return data_acquisition_function().then((data) => {

			let transformed_data = this.transformData(data);

			this.setDownloadHeaders(transformed_data);

			return transformed_data;

		});

	}

	setDownloadHeaders(transformed_data){
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
		let name = randomutilities.createRandomString(10).toLowerCase();
		let extension = this.getFileExtension();

		return name+extension;

	}

	getFileExtension(){
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
		return Buffer.byteLength(content.toString(), 'utf8');

	}

	setDownloadParameters(parameters){
		if(!_.isObject(parameters)){

			throw eu.getError('bad_request','Invalid download parameter type.');

		}

		if(!_.has(parameters, 'type')){

			throw eu.getError('bad_request','Download parameters missing type field.');

		}

		if(!_.includes(this.available_types, parameters.type)){

			throw eu.getError('bad_request','Download type is not supported.');

		}

		this.download_parameters = parameters;

	}

	transformData(data){
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
		let discovered_data = objectutilities.recurseByDepth(data, function(key, value){

			return _.isArray(value);

		});

		if(_.isNull(discovered_data)){

			du.warning('Unable to identify suitable discovered_data.');

		}

		return discovered_data;

	}

	JSONToCSV(data){
		let data_array = this.recurseForArray(data);

		if(_.isNull(data_array)){

			data_array = data;

		}

		return j2csv({data: data_array});

	}

	JSONToExcel(data){
		let data_array = this.recurseForArray(data);

		if(_.isNull(data_array)){

			data_array = [data];

		}

		var ws = XLSX.utils.json_to_sheet(JSON.parse(JSON.stringify(data_array)));

		return ws;

	}

}


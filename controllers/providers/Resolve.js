
const _ = require('lodash');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const DownloadController = global.SixCRM.routes.include('providers', 'Download');

module.exports = class ResolveController {

	constructor(){

		this.download_parameters = {};

		this.downloadController = new DownloadController();

	}

	setCacheParameters(parameters){

		this.cache_parameters = parameters;

	}

	setDownloadParameters(parameters){

		//Technical Debt: validate parameters
		this.download_parameters = parameters;

	}

	resolve(data_aquisition_function){

		du.debug('Resolve');

		if(_.has(this, 'cache_parameters') && _.has(this.cache_parameters, 'use_cache')){

			global.use_cache = false;

		}

		if(_.has(this, 'download_parameters') && _.has(this.download_parameters, 'type') && _.includes(this.downloadController.available_types, this.download_parameters.type)){

			return this.downloadController.resolveDownload(this.download_parameters, data_aquisition_function);

		}

		return data_aquisition_function();

	}

}

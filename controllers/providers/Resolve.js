'use strict';
const _ = require("underscore");
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = class ResolveController {

    constructor(){

        this.download_parameters = {};

        this.downloadController = global.SixCRM.routes.include('providers', 'Download');

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

        if(_.has(this, 'download_parameters') && _.has(this.download_parameters, 'type') && _.contains(this.downloadController.available_types, this.download_parameters.type)){

            return this.downloadController.resolveDownload(this.download_parameters, data_aquisition_function);

        }

        return data_aquisition_function();

    }

}

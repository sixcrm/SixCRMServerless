'use strict'
require('./routes.js');
const _ = require('underscore');

const Six = class SixCRM {

  constructor(){

    this.routes = global.routes;

  }

  instantiate(){

    let Configuration = this.routes.include('core', 'Configuration.js');
    let LocalCache = this.routes.include('core', 'LocalCache.js');

    this.configuration = new Configuration();
    this.localcache = new LocalCache();

  }

  setConfigurationFile(){

    this.configuration.setEnvironmentConfigurationFile();

  }

}

if(!_.has(global, 'SixCRM')){
  global.SixCRM = new Six();
  global.SixCRM.instantiate();
}

module.exports = new Six;

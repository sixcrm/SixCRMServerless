'use strict'
require('./routes.js');
const _ = require('underscore');

class SixCRM {

  constructor(){

    this.routes = global.routes;

  }

  instantiate(){

    let Configuration = this.routes.include('core', 'Configuration.js');
    let LocalCache = this.routes.include('core', 'LocalCache.js');

    this.configuration = new Configuration();
    this.localcache = new LocalCache();

    this.configuration.setEnvironmentConfigurationFile();

  }

}

if(!_.has(global, 'SixCRM')){
  global.SixCRM = new SixCRM();
  global.SixCRM.instantiate();
}

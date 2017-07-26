'use strict'
require('./routes.js');

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

global.SixCRM = new SixCRM();
global.SixCRM.instantiate();

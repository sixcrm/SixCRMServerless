'use strict'
require('./routes.js');

class SixCRM {

  constructor(){

    this.routes = global.routes;

  }

}

global.SixCRM = new SixCRM();

let Configuration = global.SixCRM.routes.include('core', 'Configuration.js');
let LocalCache = global.SixCRM.routes.include('core', 'LocalCache.js');

global.SixCRM.configuration = new Configuration();
global.SixCRM.localcache = new LocalCache();

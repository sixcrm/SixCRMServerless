'use strict';
require('./routes.js');
const _ = require('underscore');

const Six = class SixCRM {

  constructor() {

    this.routes = global.routes;
    this._resources = {};

  }

  clearState() {

    this.instantiate();
    this.setConfigurationFile();

  }

  instantiate() {

    let Configuration = this.routes.include('core', 'Configuration.js');

    this.configuration = new Configuration();

    let LocalCache = this.routes.include('core', 'LocalCache.js');

    this.localcache = new LocalCache();

  }

  setConfigurationFile() {

    this.configuration.setEnvironmentConfigurationFile();

  }

  setResource(identifer, resource) {

    this._resources[identifer] = resource;

  }

  getResource(identifier) {

    return this._resources[identifier];

  }

};

if (!_.has(global, 'SixCRM')) {
  global.SixCRM = new Six();
  global.SixCRM.instantiate();
  global.SixCRM.setConfigurationFile();
}

module.exports = Six;

require('./routes.js');
const _ = require('lodash');
const Configuration = require('./core/Configuration');
const LocalCache = require('./core/LocalCache');

class SixCRM {

	constructor() {

		this.routes = global.routes;
		this._resources = {};

	}

	instantiate() {

		this.configuration = new Configuration();
		this.localcache = new LocalCache();

	}

	setResource(identifer, resource) {

		this._resources[identifer] = resource;

	}

	getResource(identifier) {

		return this._resources[identifier];

	}

}

if (!_.has(global, 'SixCRM')) {
	global.SixCRM = new SixCRM();
	global.SixCRM.instantiate();
}

const _ = require('lodash');
const Routes = require('./routes.js');
const Configuration = require('./core/Configuration');
const LocalCache = require('./core/LocalCache');

class SixCRM {

	constructor() {

		this.routes = new Routes();
		this._resources = {};

		this.configuration = new Configuration(this.routes);
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
}

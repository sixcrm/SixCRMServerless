require('./routes.js');
const _ = require('lodash');

class SixCRM {

	constructor() {

		this.routes = global.routes;
		this._resources = {};

	}

	instantiate() {

		const Configuration = this.routes.include('core', 'Configuration.js');
		const LocalCache = this.routes.include('core', 'LocalCache.js');

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

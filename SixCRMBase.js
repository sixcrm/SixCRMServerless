
require('./routes.js');

class SixCRMBase {

	constructor() {

		this.routes = global.routes;
		this._resources = {};

	}

	clearState() {

		this.instantiate();

	}

	instantiate() {

		const Configuration = this.routes.include('core', 'Configuration.js');
		const LocalCache = this.routes.include('core', 'LocalCache.js');

		this.configuration = new Configuration();
		this.localcache = new LocalCache();

	}

	setConfigurationFile() {

	}

	setResource(identifer, resource) {

		this._resources[identifer] = resource;

	}

	getResource(identifier) {

		return this._resources[identifier];

	}

}

module.exports = SixCRMBase;

const _ = require('lodash');
const du = require('./lib/debug-utilities');
const Routes = require('./routes.js');
const Configuration = require('./core/Configuration');
const LocalCache = require('./core/LocalCache');
const ajv = require('./controllers/providers/ajv-provider');

class SixCRM {

	constructor() {

		this.routes = new Routes();
		this._resources = {};

		this.configuration = new Configuration(this.routes);
		this.localcache = new LocalCache();
		this.validation = ajv;
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

process.on('unhandledRejection', (error, promise) => {
	du.fatal("Unhandled promise rejection", error, promise);
	throw error;
});

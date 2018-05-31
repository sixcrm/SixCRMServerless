const _ = require('lodash');
const crypto = require('crypto');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const RedisProvider = global.SixCRM.routes.include('controllers', 'providers/redis-provider.js');

module.exports = class cacheController {

	constructor(prefix) {

		if (_.isString(prefix)) {
			this.key_prefix = prefix;
		}

		this.redisprovider = new RedisProvider();

	}

	//Technical Debt:  Refactor this this to be testable!
	//Technical Debt:  The data_promise variable is executed regardless of whether there are cached results or not.
	async useCache(parameters, data_promise, expiration) {

		du.debug('Use Cache');

		this.validatePromise(data_promise);

		if (this.cacheActive() && this.cacheEnabled()) {

			let cache_key = this.createKey(parameters);

			let result;
			await this.redisprovider.withConnection(async () => {

				result = await this.getCache(cache_key);
				if (!_.isNull(result)) {

					du.debug('Redis Hit: ' + cache_key);
					result = this.parseResult(result);
					du.debug('Cached Result', result);

				} else {

					du.debug('Redis Miss: ' + cache_key);
					result = await data_promise();
					du.debug('Data Promise Result:', result);

					const reply = await this.setCache(cache_key, JSON.stringify(result), expiration);
					du.debug('Redis Set for key "' + cache_key + '": ' + reply);

				}

			});

			return result;

		} else {

			return data_promise();

		}

	}

	parseResult(result) {

		du.debug('Parse Result');

		try {

			let return_value = JSON.parse(result);

			return return_value;

		} catch (error) {

			return result;

		}

	}

	getCache(key) {

		du.debug('Get Cache');

		return this.redisprovider.get(key);

	}

	setCache(key, result, expiration) {

		du.debug('Set Cache');

		return this.redisprovider.set(key, result, expiration);

	}

	createKey(parameters) {

		du.debug('Create Key');

		let prehash = parameters;

		if (_.isArray(parameters)) {

			prehash = 'array' + parameters.sort().join(':');

		} else if (_.isString(parameters)) {

			prehash = 'string' + parameters.trim();

		} else if (_.isObject(parameters)) {

			prehash = 'object';
			for (var k in parameters) {
				if (parameters.hasOwnProperty(k)) {
					prehash += k + ':' + parameters[k];
				}
			}

		}

		prehash = this.prependPrefix(prehash);

		prehash = this.appendCachebuster(prehash);

		return crypto.createHash('sha1').update(prehash).digest('hex');

	}

	prependPrefix(prehash) {

		du.debug('Prepend Prefix');

		if (_.has(this, 'key_prefix')) {
			prehash = this.key_prefix + '-' + prehash;
		}

		return prehash;

	}

	appendCachebuster(prehash) {

		du.debug('Append Cachebuster');

		if (objectutilities.hasRecursive(global, 'SixCRM.configuration.site_config.cache.cachebuster')){
			prehash = prehash + '-' + global.SixCRM.configuration.site_config.cache.cachebuster;
		}

		return prehash;

	}

	validatePromise(data_promise) {

		du.debug('Validate Promise');

		if (!_.isFunction(data_promise)) {

			throw eu.getError('server', 'Callback_promise.then is not a function.');

		}

		return true;

	}

	cacheActive() {

		du.debug('Cache Active');

		if (objectutilities.hasRecursive(global.SixCRM, 'configuration.site_config.cache.usecache') && parseInt(global.SixCRM.configuration.site_config.cache.usecache) > 0) {

			du.warning('Cache Active');

			return true;

		}

		du.warning('The cache is not active.  Please check serverless configuration.');

		return false;

	}

	setDisable(setting) {

		du.debug('Set Disable');

		this.disable = setting;

	}

	cacheEnabled() {

		du.debug('Cache Enabled');

		if (_.has(this, 'disable') && this.disable === true) {

			du.warning('Cache Disabled (Local Setting)');

			return false;

		}

		if (_.has(global, 'use_cache') && global.use_cache == false) {

			du.warning('Cache Disabled (Global Setting)');

			return false;

		}

		return true;

	}

}

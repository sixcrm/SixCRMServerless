const _ = require('lodash');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const numberutilities = global.SixCRM.routes.include('lib', 'number-utilities.js');

const Redis = require('@adexchange/aeg-redis');

module.exports = class RedisProvider {

	constructor() {

		const elasticache_config = global.SixCRM.configuration.site_config.elasticache;

		this.default_expiration = elasticache_config.default_expiration;

		this.endpoint = elasticache_config.endpoint;
		if (!this.endpoint) {
			throw eu.getError('server', 'Redis endpoint is unset');
		}

		this.port = elasticache_config.port;
		this.max_attempts = elasticache_config.max_attempts;
	}

	connect() {
		if (!objectutilities.hasRecursive(global, 'SixCRM.configuration.site_config.cache.usecache') || (parseInt(global.SixCRM.configuration.site_config.cache.usecache) < 1)) {
			du.debug('Cache Disabled.  Skipping Redis instantiation.');

			return Promise.reject('Cache Disabled. Skipping Redis instantiation.');

		}
		du.debug('Cache Enabled - Creating Redis Client...');

		const options = {
			host: this.endpoint,
			port: this.port,
			connect_timeout: 3600,
			retry_strategy: this.retryStrategy
		};

		du.debug('Redis Configuration: ', options);

		this.when_redis_ready = new Promise((resolve, reject) => {

			this.redis_client = new Redis.Client(options);
			this.redis_client.client
				.on('ready', () => {
					du.deep('Redis ready.');
					this.redis_client.client.removeAllListeners('error');
					return resolve();
				})
				.on('error', (error) => {
					du.deep(error);
					return reject();
				})
				.on('connect', () => {
					du.deep('Redis connected.')
				})
				.on('end', () => {
					du.deep('Redis connection closed.')
				})
				.on('reconnecting', () => {
					du.deep('Redis reconnecting...')
				})
				.on('warning', (warning) => {
					du.warning('Redis Warning: ', warning)
				});

		});

		return this.when_redis_ready;
	}

	async dispose() {
		await this.redis_client.dispose();

		this.redis_client = null;
	}

	async execute(promised_callback) {

		du.deep('redis-utils: querying');

		try {

			return await promised_callback();

		}
		catch(error) {

			du.error(error);
			throw eu.getError('server', error);

		}
	}

	flushAll() {
		du.debug('Flush All');

		return this.execute(() => this.redis_client.client.flushdb());
	}

	async get(key) {
		du.debug('Get');

		let result = await this.execute(() => this.redis_client.get(key));

		try {

			result = JSON.parse(result);

		} catch (error) {	// Just tried to convert.
		}

		return result;
	}

	set(key, value, expiration) {
		du.debug('Set');

		value = this.prepareValue(value);
		expiration = this.getExpiration(expiration);

		return this.execute(() => this.redis_client.set(key, value, { EX: expiration }));
	}

	prepareValue(value) {
		du.debug('Prepare Value');

		if (!_.isString(value) && !_.isObject(value)) {
			throw eu.getError('server', 'Value must be a string or an object');
		}

		if (_.isObject(value)) {
			value = JSON.stringify(value);
		}

		return value;
	}

	getExpiration(expiration) {
		du.debug('Get Expiration');

		if (_.isUndefined(expiration)) {
			if (!_.has(this, 'default_expiration')) {

				throw eu.getError('validation', 'No default expiration set.');

			}

			expiration = this.default_expiration;

		}

		if (!numberutilities.isInteger(expiration) || expiration < 0) {

			throw eu.getError('validation', 'Invalid expiration.');

		}

		return expiration;
	}

	retryStrategy(options) {

		du.info(options);

		du.debug('Retry Strategy');

		if (options.error && options.error.code === 'ECONNREFUSED') {

			return new Error('The server refused the connection');

		}

		if (options.total_retry_time > 60 * 60 * 1000) {

			return new Error('Retry time exhausted');

		}

		if (options.attempt > this.max_attempts) {

			return undefined;

		}

		return Math.min(options.attempt * 100, 1000);
	}

	test(){

		du.debug('Test');

		return this.set('test', 'test').then(result => {
			if(result == 'OK'){
				return {status: 'OK', message: 'Successfully connected to ElastiCache.'};
			}
			return {status: 'ERROR', message: 'Unable to connect to ElastiCache.'};
		}).catch(error => {
			return {status: 'ERROR', message: error.message};
		})
	}

}

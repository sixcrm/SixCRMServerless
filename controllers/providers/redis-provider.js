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

		if (global.SixCRM.configuration.isLocal()) {

			this.endpoint = elasticache_config.endpoint;

		} else {

			this.endpoint = process.env.elasticache_endpoint;

		}

		if (!this.endpoint) {

			throw eu.getError('server', 'Redis endpoint is unset');

		}

		this.port = elasticache_config.port;
		this.max_attempts = elasticache_config.max_attempts;
	}

	/*
	 * NOTE: A previous iteration of this provider connected automatically for every call, and scheduled
	 * a disconnect.  This was redesigned to allow the local lambda scope to control the connection lifecycle.
	 * In most cases, you will just connect when you open the scope, and dispose the connection when the
	 * scope is disposed.  If you're using this provider without a lambda scope, you must connect first, and
	 * dispose the connection when you are finished.  The withConnection() method does this for you.
	 * Example:
	 *
	 * const redis_provider = new RedisProvider();
	 * await redis_provider.withConnection(() => {
	 *
	 *   await redis_provider.set(key, value, expiration);
	 *   ...
	 *   value = await redis_provider.get(key);
	 * });
	 */
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
					du.debug('Redis ready.');
					this.redis_client.client.removeAllListeners('error');
					return resolve();
				})
				.on('error', (error) => {
					du.debug(error);
					return reject();
				})
				.on('connect', () => {
					du.debug('Redis connected.')
				})
				.on('end', () => {
					du.debug('Redis connection closed.')
				})
				.on('reconnecting', () => {
					du.debug('Redis reconnecting...')
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

	async withConnection(promised_callback) {
		await this.connect();
		try {
			await promised_callback();
		} finally {
			await this.dispose();
		}
	}

	async execute(promised_callback) {

		du.debug('redis-utils: querying');

		try {

			return await promised_callback();

		} catch (error) {

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

		} catch (error) { // Just tried to convert.
		}

		return result;
	}

	set(key, value, expiration) {
		du.debug('Set');

		value = this.prepareValue(value);
		expiration = this.getExpiration(expiration);

		return this.execute(() => this.redis_client.set(key, value, {
			EX: expiration
		}));
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

	async test() {

		du.debug('Test');

		try {

			await this.connect();
			await this.set('test', 'test');
			return {
				status: 'OK',
				message: 'Successfully connected to ElastiCache.'
			};

		} catch (error) {

			return {
				status: 'ERROR',
				message: error.message
			};

		} finally {

			await this.dispose();

		}

	}

}

const du = require('../lib/debug-utilities');
const eu = require('../lib/error-utilities');
const ConfigurationUtilities = require('./ConfigurationUtilities');

module.exports = class Configuration extends ConfigurationUtilities {

	constructor(routes, stage) {

		super(routes);

		this.handleStage(stage);

		this.setConfigurationFiles();

	}

	handleStage(stage) {

		du.debug('Handle Stage');

		this.stage = this.resolveStage(stage);

		this.setEnvironmentVariable('stage', this.stage);

	}

	setConfigurationFiles() {

		du.debug('Set Configuration Files');

		this.serverless_config = this.getServerlessConfig();

		this.site_config = this.getSiteConfig();

	}

	getServerlessConfig() {

		du.debug('Get Serverless Config');

		return this.routes.include('root', 'serverless.yml');

	}

	getStageDomain(){

		du.debug('Get Stage Domain');

		return this.site_config.site.domain;

	}

	getSiteConfig() {

		du.debug('Get Site Config');

		let config;

		try {
			config = this.routes.include('config', this.stage + '/site.yml');
		} catch (error) {
			throw eu.getError('server', 'Configuration.getSiteConfig was unable to identify file ' + this.routes.path('config', this.stage + '/site.yml'));
		}

		return config;

	}

}

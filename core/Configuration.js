const _ = require('lodash');
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

	getBase(subdomain = null){

		du.debug('Get Base');

		return [
			'https://',
			this.getSubdomainPath(subdomain),
			'/'
		].join('');

	}

	getSubdomainPath(subdomain = null){

		du.debug('Get Subdomain Path');

		let settings = {
			stage: this.stage,
			stage_seperator: '-',
			subdomain: subdomain,
			subdomain_seperator: '.',
			domain: this.getStageDomain()
		}

		if(_.isUndefined(subdomain) || _.isNull(subdomain)){
			settings.subdomain_seperator = '';
			settings.stage = '';
			settings.stage_seperator = '';
			settings.subdomain_seperator = '';
		}

		if(!_.has(this, 'site_config') || !_.has(this.site_config, 'site') || !_.has(this.site_config.site, 'include_stage') || this.site_config.site.include_stage == false){
			settings.stage_seperator = '',
			settings.stage = '';
		}

		return Object.values(settings).join('');

	}

	getStageDomain(){

		du.debug('Get Stage Domain');

		if(_.has(this, 'site_config') && _.has(this.site_config, 'site') && _.has(this.site_config.site, 'domain')){
			return this.site_config.site.domain;
		}

		return null;

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

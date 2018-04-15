
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const ConfigurationUtilities = global.SixCRM.routes.include('controllers', 'core/ConfigurationUtilities.js');

module.exports = class Configuration extends ConfigurationUtilities {

	constructor(stage) {

		super();

		this.setConfigurationInformation();

		this.handleStage(stage);

		this.setConfigurationFiles();

		this.mandatory_config_names = {
			redshift_host: 'redshift_host',
			aurora_host: 'aurora_host',
			cloudsearch_domainendpoint: 'cloudsearch_domainendpoint'
		}

	}

	isLocal() {

		return !_.contains(['development', 'staging', 'production'], global.SixCRM.configuration.stage);

	}

	setConfigurationInformation() {

		this.config_bucket_template = 'sixcrm-{{stage}}-configuration-master';

		this.s3_environment_configuration_file_key = 'config.json';

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

		//this.evaluateStatus();

	}


	setEnvironmentConfigurationFile() {

		du.debug('Set Environment Configuration Files');

		return;

	}


	getServerlessConfig() {

		du.debug('Get Serverless Config');

		return global.SixCRM.routes.include('root', 'serverless.yml');

	}

	getSiteConfig() {

		du.debug('Get Site Config');

		let config;

		try {

			config = global.SixCRM.routes.include('config', this.stage + '/site.yml');

		} catch (error) {

			du.error(error);
			eu.throwError('server', 'Configuration.getSiteConfig was unable to identify file ' + global.SixCRM.routes.path('config', this.stage + '/site.yml'));

		}

		return config;

	}

	getEnvironmentConfig(field /*, use_cache , waitfor*/){

		if(_.has(process.env, field)){
			return Promise.resolve(process.env[field]);
		}

		eu.throwError('server', 'Process.env missing key: "'+field+'".');

	}

}

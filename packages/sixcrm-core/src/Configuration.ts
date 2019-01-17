import * as _ from 'lodash';
import du from './util/debug-utilities';
import eu from './util/error-utilities';
import objectutilities from './util/object-utilities';
import Routes from './routes';

export default class Configuration {

	routes: Routes;
	stage: string;
	site_config: any;
	serverless_config: any;

	constructor(routes: Routes, stage?: string) {

		this.routes = routes;

		this.handleStage(stage);

		this.setConfigurationFiles();

	}

	setEnvironmentVariable(key: string, value: string) {

		du.debug('Set Environment Variable');

		process.env[key] = value;

	}

	resolveStage(stage?: string | null) {

		du.debug('Resolve Stage');

		if (stage === undefined) {

			if (process.env.stage !== undefined) {

				stage = process.env.stage;

				const stages = this.routes.include('config', 'stages.yml');

				const stage_names = objectutilities.getKeys(stages);

				if (!_.includes(stage_names, stage)) {

					throw eu.getError('server', 'Configuration.resolveStage unable to validate stage name: ' + stage);

				}

			} else {

				stage = this.determineStageFromBranchName(false);

				if (_.isNull(stage)) {

					stage = this.determineStageFromAccountIdentifier(false);

				}

			}

		}

		if (_.isNull(stage) || _.isUndefined(stage)) {
			if (process.env.CIRCLECI) {
				stage = 'circle';
			}
			else {
				stage = 'local';
			}
		}

		du.warning('Stage: ' + stage);

		return stage;

	}

	determineStageFromBranchName(fatal = true) {

		du.debug('Determine Stage From Branch Name');

		const branch_name = this.getBranchName();

		if (!_.isNull(branch_name)) {

			const stages = this.routes.include('config', 'stages.yml');

			let identified_stage: string | null = null;

			objectutilities.map(stages, (key) => {
				const stage = stages[key];

				if (stage.branch_name === branch_name) {
					identified_stage = key;
				}
			});

			if (!_.isNull(identified_stage)) {
				return identified_stage as string;
			}

			if (fatal) {
				throw eu.getError('server', 'Unrecognized branch_name in stage.yml: ' + branch_name);
			}

		}

		return null;

	}

	determineStageFromAccountIdentifier(fatal = true) {

		du.debug('Determine Stage From Account Identifier');

		const account_identifier = this.getAccountIdentifier();

		if (account_identifier !== null) {

			const stages = this.routes.include('config', 'stages.yml');

			let identified_stage: string | null = null;

			objectutilities.map(stages, (key) => {
				const stage = stages[key];

				if (_.has(stage, 'aws_account_id') && (stage.aws_account_id === account_identifier)) {
					identified_stage = key;
				}
			});

			if (identified_stage !== null) {
				return identified_stage as string;
			}

			if (fatal) {
				throw eu.getError('server', 'Unrecognized account identifier in stage.yml: ' + account_identifier);
			}

		}

		return null;

	}

	getAccountIdentifier() {

		du.debug('Get Account Identifier');

		return this.getAccountIdentifierFromEnvironment();

	}

	getBranchName() {

		du.debug('Get Branch Name');

		const branch_name = this.getBranchNameFromEnvironment();

		return branch_name;

	}

	getBranchNameFromEnvironment() {

		du.debug('Get Branch Name From Environment');

		if (process.env.CIRCLE_BRANCH !== undefined) {
			return process.env.CIRCLE_BRANCH;
		}

		return null;

	}

	getAccountIdentifierFromEnvironment() {

		du.debug('Get Account Identifier From Environment');

		if (process.env.AWS_ACCOUNT !== undefined) {
			return process.env.AWS_ACCOUNT;
		} else if (process.env.aws_account !== undefined) {
			return process.env.aws_account;
		}

		return null;

	}

	isLocal() {

		du.debug('Is Local');

		const stages = this.routes.include('config', 'stages.yml');

		if (!_.has(stages, global.SixCRM.configuration.stage)) {
			throw eu.getError('server', 'Unrecognized stage: ' + global.SixCRM.configuration.stage);
		}

		const result = !_.has(stages[global.SixCRM.configuration.stage], 'aws_account_id');

		du.debug(`Is Local: ${result}`);

		return result;

	}

	getEnvironmentConfig(field: string, fatal = true) {

		if (_.has(process.env, field)) {

			du.debug(`getEnvironmentConfig: ${field} = ${process.env[field]}`);

			return Promise.resolve(process.env[field]);

		}

		if (fatal) {

			throw eu.getError('server', 'Process.env missing key: "' + field + '".');

		}

		du.debug(`getEnvironmentConfig: ${field} = null`);

		return null;

	}

	handleStage(stage?: string) {

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

	getBase(subdomain?: string) {

		du.debug('Get Base');

		return [
			'https://',
			this.getSubdomainPath(subdomain),
			'/'
		].join('');

	}

	getSubdomainPath(subdomain?: string) {

		du.debug('Get Subdomain Path');

		const settings = {
			stage: this.stage,
			stage_seperator: '-',
			subdomain,
			subdomain_seperator: '.',
			domain: this.getStageDomain()
		};

		if (subdomain === undefined) {
			settings.subdomain_seperator = '';
			settings.stage = '';
			settings.stage_seperator = '';
			settings.subdomain_seperator = '';
		}

		if (!_.has(this, 'site_config') || !_.has(this.site_config, 'site') || !_.has(this.site_config.site, 'include_stage') || this.site_config.site.include_stage === false) {
			settings.stage_seperator = '',
			settings.stage = '';
		}

		return Object.values(settings).join('');

	}

	getStageDomain() {

		du.debug('Get Stage Domain');

		if (_.has(this, 'site_config') && _.has(this.site_config, 'site') && _.has(this.site_config.site, 'domain')) {
			return this.site_config.site.domain as string;
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

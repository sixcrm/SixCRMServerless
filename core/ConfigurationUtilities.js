const _ = require('lodash');
const du = require('../lib/debug-utilities');
const eu = require('../lib/error-utilities');
const objectutilities = require('../lib/object-utilities');

module.exports = class ConfigurationUtilities {

	constructor(routes) {
		this.routes = routes;
	}

	setEnvironmentVariable(key, value) {

		du.debug('Set Environment Variable');

		process.env[key] = value;

	}

	resolveStage(stage) {

		du.debug('Resolve Stage');

		if (_.isUndefined(stage)) {

			if (_.has(process.env, 'stage')) {

				stage = process.env.stage;

				let stages = this.routes.include('config', 'stages.yml');

				let stage_names = objectutilities.getKeys(stages);

				if (!_.includes(stage_names, stage)) {

					throw eu.getError('server', 'Configuration.resolveStage unable to validate stage name: ' + stage);

				}

			} else {

				stage = this.determineStageFromBranchName();

				if (_.isNull(stage)) {

					stage = this.determineStageFromAccountIdentifier();

				}

			}

		}

		if (_.isNull(stage) || _.isUndefined(stage)) {
			stage = 'local'
		}

		du.warning('Stage: ' + stage);

		return stage;

	}

	determineStageFromBranchName(fatal = true) {

		du.debug('Determine Stage From Branch Name');

		let branch_name = this.getBranchName();

		if (!_.isNull(branch_name)) {

			let stages = this.routes.include('config', 'stages.yml');

			let identified_stage = null;

			objectutilities.map(stages, key => {
				let stage = stages[key];

				if (stage.branch_name == branch_name) {
					identified_stage = key
				}
			});

			if (!_.isNull(identified_stage)) {
				return identified_stage;
			}

			if (fatal) {
				throw eu.getError('server', 'Unrecognized branch_name in stage.yml: ' + branch_name);
			}

		}

		return null;

	}

	determineStageFromAccountIdentifier(fatal = true) {

		du.debug('Determine Stage From Account Identifier');

		let account_identifier = this.getAccountIdentifier();

		if (!_.isNull(account_identifier)) {

			let stages = this.routes.include('config', 'stages.yml');

			let identified_stage = null;

			objectutilities.map(stages, key => {
				let stage = stages[key];

				if (_.has(stage, 'aws_account_id') && (stage.aws_account_id == account_identifier)) {
					identified_stage = key
				}
			});

			if (!_.isNull(identified_stage)) {
				return identified_stage;
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

		let branch_name = this.getBranchNameFromEnvironment();

		return branch_name;

	}

	getBranchNameFromEnvironment() {

		du.debug('Get Branch Name From Environment');

		if (_.has(process.env, 'CIRCLE_BRANCH')) {
			return process.env.CIRCLE_BRANCH;
		}

		return null;

	}

	getAccountIdentifierFromEnvironment() {

		du.debug('Get Account Identifier From Environment');

		if (_.has(process.env, 'AWS_ACCOUNT')) {
			return process.env.AWS_ACCOUNT;
		} else if (_.has(process.env, 'aws_account')) {
			return process.env.aws_account;
		}

		return null;

	}

	isLocal() {

		du.debug('Is Local');

		let stages = this.routes.include('config', 'stages.yml');

		if (!_.has(stages, global.SixCRM.configuration.stage)) {
			throw eu.getError('server', 'Unrecognized stage: ' + global.SixCRM.configuration.stage);
		}

		const result = !_.has(stages[global.SixCRM.configuration.stage], 'aws_account_id');

		du.debug(`Is Local: ${result}`);

		return result;

	}

	getEnvironmentConfig(field, fatal = true) {

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

}

const _ = require('lodash');

module.exports = class FeatureFlagHelperController {

	constructor() {

	}

	getFeatureFlag({
		environment = 'default',
		account = 'default'
	}) {
		if (_.has(global, 'account')) {
			account = global.account;
		}

		return this.getByEnvironmentAndAccount({
			environment: environment,
			account: account
		});

	}

	async getByEnvironmentAndAccount({
		environment = 'default',
		account = 'default'
	}) {
		if (!_.has(this, 'featureFlagController')) {
			const FeatureFlagController = global.SixCRM.routes.include('entities', 'FeatureFlag.js');
			this.featureFlagController = new FeatureFlagController();
		}

		let document = await this.featureFlagController.get({
			id: environment,
			range_key: account
		});

		if (!_.isNull(document)) {
			return document;
		}

		document = await this.featureFlagController.get({
			id: environment,
			range_key: 'default'
		});

		if (!_.isNull(document)) {
			return document;
		}

		document = await this.featureFlagController.get({
			id: 'default',
			range_key: 'default'
		});

		return document;

	}

}

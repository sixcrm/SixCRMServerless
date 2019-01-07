const _ = require('lodash');

const timestamp = require('@6crm/sixcrmcore/util/timestamp').default;
const signature = require('@6crm/sixcrmcore/util/signature').default;
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const AccessKeyController = global.SixCRM.routes.include('controllers', 'entities/AccessKey.js');

module.exports = class verifySignatureController {

	constructor() {
		this.accessKeyController = new AccessKeyController();
	}

	execute(event) {

		return this.parseEventSignature(event)
			.then(this.createTokenObject.bind(this))
			.then(this.verifyTimestamp.bind(this))
			.then(this.verifySignature.bind(this))
			.then(this.populateAuthorityUser.bind(this));

	}

	parseEventSignature(event) {
		const tokens = event.authorizationToken.split(':');

		if (!_.isArray(tokens) || !(tokens.length == 3)) {

			du.warning('Signature failed:  Incorrect structure');

			return Promise.reject(false);

		}

		return Promise.resolve(tokens);

	}

	createTokenObject(tokens) {
		return new Promise((resolve, reject) => {

			this.accessKeyController.disableACLs();
			this.accessKeyController.getAccessKeyByKey(tokens[0]).then((access_key) => {
				this.accessKeyController.enableACLs();

				if (_.has(access_key, 'secret_key') && _.has(access_key, 'id')) {

					let token_object = {
						access_key: access_key,
						timestamp: tokens[1],
						signature: tokens[2]
					};

					return resolve(token_object);

				} else {

					return reject(eu.getError('not_implemented', 'Unset Access Key properties.'));

				}

			}).catch((error) => {

				return reject(error);

			});

		});

	}


	verifyTimestamp(token_object) {
		let time_difference = timestamp.getTimeDifference(token_object.timestamp);

		if (time_difference > (60 * 60 * 5)) {

			du.warning('Signature failed:  Timestamp expired');

			return Promise.reject(false);

		}

		du.info('Timestamp valid');

		return Promise.resolve(token_object);

	}

	verifySignature(token_object) {
		if (!signature.validateSignature(token_object.access_key.secret_key, token_object.timestamp, token_object.signature)) {

			du.warning('Signature failed:  Incorrect Signature');

			return Promise.reject(false);

		} else {

			du.info('Signature valid');

			return Promise.resolve(token_object);

		}

	}

	populateAuthorityUser() {
		return {
			id: 'system@sixcrm.com'
		};

	}

}

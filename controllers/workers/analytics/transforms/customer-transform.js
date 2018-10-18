const util = require('util');
const AnalyticsTransform = require('../analytics-transform');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;

module.exports = class CustomerTransform extends AnalyticsTransform {

	async transform(record) {

		du.debug('CustomerTransform.transform()', util.inspect(record, {
			showHidden: false,
			depth: null
		}));

		const entity = record.context;
		const result = {
			id: entity.id,
			account: entity.account,
			firstname: entity.firstname,
			lastname: entity.lastname,
			email: entity.email,
			phone: entity.phone,
			city: entity.address && entity.address.city,
			state: entity.address && entity.address.state,
			zip: entity.address && entity.address.zip,
			created_at: entity.created_at,
			updated_at: entity.updated_at
		};

		return result;

	}

}

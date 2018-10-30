const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

module.exports = class FeatureFlagController extends entityController {

	constructor(){

		super('featureflag');

		this.primary_key = 'environment';
		this.range_key = 'account';

	}

	async get(){

		du.debug('FeatureFlag.get()');

		//Technical Debt: Hack!
		this.disableACLs();
		let result = await super.get(arguments[0]);
		this.enableACLs();

		return result;

	}

	delete({id, range_key = null}) {
		if (global.account !== '*') {
			throw eu.getError('server', 'You are not allowed to delete the entity.')
		}

		return super.delete({id, range_key})
	}

}

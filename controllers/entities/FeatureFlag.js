const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
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

}

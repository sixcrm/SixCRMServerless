const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

module.exports = class FeatureFlagController extends entityController {

	constructor(){

		super('featureflag');

		this.primary_key = 'environment';
		this.range_key = 'account';

	}

}

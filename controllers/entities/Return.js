const _ = require('lodash');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

module.exports = class ReturnController extends entityController {

	constructor() {

		super('return');

		this.search_fields = ['alias'];

	}

	//Technical Debt: finish!
	associatedEntitiesCheck() {
		return Promise.resolve([]);
	}

	create({
		entity
	}) {

		du.debug('Return.create()');

		const ReturnHelperController = global.SixCRM.routes.include('helpers', 'entities/return/Return.js');
		let returnHelperController = new ReturnHelperController();

		if (!_.has(entity, 'alias')) {
			entity.alias = returnHelperController.createAlias();
		}

		return returnHelperController.mergeHistories(entity).then((entity) => super.create({
			entity: entity
		}));

	}

	update({
		entity,
		ignore_updated_at
	}) {

		du.debug('Return.update()');

		const ReturnHelperController = global.SixCRM.routes.include('helpers', 'entities/return/Return.js');
		let returnHelperController = new ReturnHelperController();

		return returnHelperController.mergeHistories(entity).then((entity) => super.update({
			entity: entity,
			ignore_updated_at: ignore_updated_at
		}));

	}

}
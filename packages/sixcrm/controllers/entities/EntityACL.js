const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;

const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

module.exports = class EntityACLController extends entityController {
	constructor() {
		super('entityacl');
		this.primary_key = 'entity';
	}

	listByType({type, pagination, search, fatal}) {
		return this.queryBySecondaryIndex({
			index_name: 'type-index',
			field: 'type',
			index_value: type,
			pagination,
			search,
			fatal
		});
	}

	delete({id, range_key = null}) {
		if (global.account !== '*') {
			throw eu.getError('server', `Account ${global.account} is not allowed to delete the entity.`)
		}

		return super.delete({id, range_key})
	}
}


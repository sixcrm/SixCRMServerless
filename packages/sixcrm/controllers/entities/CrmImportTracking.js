const EntityController = require('./Entity');

module.exports = class CrmImportTracking extends EntityController {

	constructor() {

		super('crmimporttracking');

	}

	bySource(account, source, sourceId, type) {

		return this.get({
			id: this._composeId(account, source, sourceId, type),
			fatal: false
		});

	}

	createBySource(account, source, sourceId, type, batch, sixId) {

		return this.create({
			entity: {
				id: this._composeId(account, source, sourceId, type),
				account,
				source,
				source_id: sourceId,
				type,
				batch,
				six_id: sixId
			},
			parameters: {
				index: false
			}
		})

	}

	_composeId(account, source, sourceId, type) {

		return `${account}-${source}-${type}-${sourceId}`;

	}

}

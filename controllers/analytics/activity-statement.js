const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const EntityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

module.exports = class ActivityStatement {

	constructor() {

		du.debug('Constructor');

		this.statement_templates = {
			actor_only: '{actor} {action}.', //Jesus wept.
			actor_and_acted_upon: '{actor} {action} {acted_upon}.', //User randy.bandy@sixcrm.com created a new product: Happy Joyful Product.
			actor_and_acted_upon_and_associated_with: '{actor} {action} {acted_upon} associated with {associated_with}.' //User randy.bandy@sixcrm.com updated a Merchant Provider associated with Campaign Happy Joyful Campaign.
		};

	}

	async buildActivityEnglishObject(record) {

		du.debug('Build Activity Statement');

		const resources = await this._acquireResources(record);
		const template = this._englishTemplate(resources);
		return this._buildObject(template, resources);

	}

	async _acquireResources(record) {

		du.debug('Acquire Resources');

		return Promise.all([
			this._get('actor', record),
			this._get('acted_upon', record),
			this._get('associated_with', record)
		]);

	}

	_englishTemplate(resources) {

		du.debug('Set English Template');

		if (resources[2] && resources[1]) {

			return this.statement_templates.actor_and_acted_upon_and_associated_with;

		} else if (resources[1]) {

			return this.statement_templates.actor_and_acted_upon;

		} else {

			return this.statement_templates.actor_only;

		}

	}

	_buildObject(template, resources) {

		du.debug('Build Object');

		return JSON.stringify({
			actor: resources[0],
			acted_upon: resources[1],
			associated_with: resources[2],
			english_template: template
		});

	}

	async _get(type, record) {

		du.debug('Get');

		if (!_.has(record, type) || record[type] === '' || record[type] === null) {

			return null;

		}

		if (record[type] === 'system' || record[type + '_type'] === 'system') {

			return {
				id: 'system',
				name: 'SixCRM',
			};

		}

		const parameters = {
			id: record[type],
			type: record[type + '_type']
		};

		const entity = await this._getEntity(parameters);

		du.info(parameters);

		if (entity && _.has(entity, 'id')) {

			return entity;

		}

		du.warning('Unable to identify ' + type + '.');

		return parameters;

	}

	_getEntity(parameters) {

		du.debug('Get Entity');

		return new EntityController(parameters.type).get({
			id: parameters.id
		});

	}

};

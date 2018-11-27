const _ = require('lodash');
const uuidV4 = require('uuid/v4');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const EventHelperController = global.SixCRM.routes.include('helpers', 'events/Event.js');
const AnalyticsEvent = global.SixCRM.routes.include('helpers', 'analytics/analytics-event.js');

module.exports = class ActivityHelper {

	constructor() {

		this._eventHelperController = new EventHelperController();

	}

	//Technical Debt:  Use Local Cache Object
	acquireGlobalUser() {

		du.debug('Acquire Global User');

		if (_.has(global, 'user')) {

			return global.user;

		}

		return null;

	}

	//Technical Debt:  Use Local Cache Object
	acquireGlobalAccount() {

		du.debug('Acquire Global Account');

		if (_.has(global, 'account')) {

			return global.account;

		}

		return null;

	}

	createActivity(actor, action, acted_upon, associated_with) {

		du.debug('Create Activity');

		actor = this.getActor(actor);
		acted_upon = this.getActedUpon(acted_upon);
		associated_with = this.getAssociatedWith(associated_with, acted_upon);

		return Promise.all([actor, acted_upon, associated_with]).then((promises) => {

			let actor = promises[0];
			let acted_upon = promises[1];
			let associated_with = promises[2];

			let account = this.getActivityAccount(acted_upon);

			let activity = {
				id: uuidV4(),
				actor: actor.id,
				actor_type: actor.type,
				action
			};

			if (!_.isNull(account)) {
				activity['account'] = account;
			}


			if (!_.isNull(acted_upon) && _.has(acted_upon, 'id') && _.has(acted_upon, 'type')) {
				activity['acted_upon'] = acted_upon.id;
				activity['acted_upon_type'] = acted_upon.type;
			}

			if (!_.isNull(associated_with) && _.has(associated_with, 'id') && _.has(associated_with, 'type')) {
				activity['associated_with'] = associated_with.id;
				activity['associated_with_type'] = associated_with.type;
			}

			return AnalyticsEvent.push('activity', activity);

		});

	}

	getActivityAccount(object) {

		du.debug('Get Activity By Account');

		let return_object = null;

		if (_.isObject(object)) {

			if (_.has(object, 'account') && !_.isNull(object.account)) {

				return_object = object.account;

			}

		}

		if (_.isNull(return_object)) {

			return_object = this.acquireGlobalAccount();

		}

		return return_object;

	}

	getActedUpon(object) {

		du.debug('Get Acted Upon');

		let return_object = this.getActivityEntity(object);

		return Promise.resolve(return_object);

	}

	getAssociatedWith(object, secondary_object) {

		du.debug('Get Associated With');

		let return_object = this.getActivityEntity(object);

		if (_.isNull(return_object) && !_.isNull(secondary_object)) {

			//infer type, get associated with
			//transaction
			//session.customer

		}

		return Promise.resolve(return_object);

	}

	getActivityEntity(object) {

		du.debug('Get Activity Entity');

		let return_object = null;

		if (_.isObject(object)) {

			if (_.has(object, 'id') && _.has(object, 'type')) {

				return_object = {
					id: object.id,
					type: object.type
				};

			}

			if (_.has(object, 'entity') && _.has(object.entity, 'id')) {

				return_object = {
					id: object.entity.id,
					type: object.type
				};

			}

		} else if (_.isString(object)) {

			//Technical Debt:  should I infer?

		}

		return return_object;

	}

	getActor(object) {

		du.debug('Get Actor');

		let return_object = null;

		//Note: If it's explicity give (case: customer/what-have-you)
		return_object = this.getActivityEntity(object);

		if (_.isNull(return_object)) {

			let actor = this.acquireGlobalUser();

			if (!_.isNull(actor)) {

				if (_.isString(actor)) {

					return_object = {
						id: actor,
						type: 'user'
					};

				} else if (_.isObject(actor)) {

					if (_.has(actor, 'id')) {

						return_object = {
							id: actor.id,
							type: 'user'
						};

					}

				}


			} else {

				return_object = {
					id: 'system',
					type: 'system'
				};

			}

		}

		return Promise.resolve(return_object);

	}

}

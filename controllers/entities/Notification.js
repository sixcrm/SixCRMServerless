

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

module.exports = class NotificationController extends entityController {

	constructor() {
		super('notification');
	}

	create({entity}) {
		entity.access_string = entity.user + '-' + entity.account + '-' + entity.type;
		return super.create({entity: entity});
	}

	numberOfUnseenNotifications() {

		du.debug('Number of Unseen Notifications');

		return this.executeAssociatedEntityFunction('NotificationReadController', 'getLastSeenTime', {})
			.then(last_seen_time => {

				return {
					key_condition_expression: '#user = :index_valuev',
					expression_attribute_values: {':index_valuev': global.user.id, ':createdv': last_seen_time}, //Technical Debt:  should not acquire global user like this...
					expression_attribute_names: {'#user': 'user'},
					filter_expression: 'created_at > :createdv',
					select: 'COUNT'
				};

			})
			.then(query_parameters => this.getCount({parameters: query_parameters, index: 'user-index'}))
			.then(data => {

				if(objectutilities.has(data, 'Count', true)){

					return {count: parseInt(data.Count)};

				}

				throw eu.getError('server', 'Response data is missing the "Count" field.');
			});

	}

	/**
     * Whether a given object is a valid notification.
     *
     * @param notification_object
     * @returns {Promise}
     */

	//Technical Debt:  Why is this necessarily a promise?
	isValidNotification(notification_object) {

		du.debug('Is Valid Notification');

		return Promise.resolve(global.SixCRM.validate(notification_object, global.SixCRM.routes.path('model', 'entities/notification.json')));

	}

	listByUser({query_parameters, user, pagination, reverse_order, fatal, append_account_filter}) {

		return this.executeAssociatedEntityFunction('NotificationReadController', 'markNotificationsAsSeen', {})
			.then(() => super.listByUser({query_parameters, user, pagination, reverse_order, fatal, append_account_filter}))

	}

	listByType({type, pagination, fatal}){

		du.debug('List By Type');

		let access_string = this.getID(global.user) + '-' + global.account + '-' + type;

		return this.queryBySecondaryIndex({field: 'access_string', index_value: access_string, index_name: 'access_string-index', pagination: pagination, fatal: fatal});
	}

}

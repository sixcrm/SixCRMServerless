
const _ = require('lodash');

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const parserutilities = require('@6crm/sixcrmcore/util/parser-utilities').default;

const ContextHelperController = global.SixCRM.routes.include('helpers', 'context/Context.js');

module.exports = class NotificationUtilities {

	constructor(){

		this.contextHelperController = new ContextHelperController();

	}

	getName(){
		if(_.has(this, 'name')){
			return this.name;
		}

		throw eu.getError('server', 'Nameless notification, very cryptic.');

	}

	getNotificationCategory(){
		if(_.has(this, 'category')){
			return this.category;
		}

		throw eu.getError('server', 'Unable to determine notification category.');

	}

	getNotificationType(){
		if(_.has(this, 'notification_type')){

			global.SixCRM.validate(this.notification_type, global.SixCRM.routes.path('model', 'helpers/notifications/notificationtype.json'));

			return this.notification_type;

		}

		throw eu.getError('server', 'Unable to determine notification type.');

	}

	getUserFromContext(context){
		du.info(context);

		let resolved_user = null;

		resolved_user = this.contextHelperController.getFromContext(context, 'user.id', 'id');

		if(_.isNull(resolved_user)){

			resolved_user = this.contextHelperController.getFromContext(context, 'user', 'email');

		}

		return resolved_user;

	}

	getAccountFromContext(context){
		du.info(context);

		let resolved_account = null;

		resolved_account = this.contextHelperController.getFromContext(context, 'account', 'id');

		if(_.isNull(resolved_account)){

			resolved_account = this.contextHelperController.getFromContext(context, 'account.id', 'id');

		}

		return resolved_account;

	}

	replaceFromContext(context, field){
		let replace_object = {};

		let tokens = parserutilities.getTokens(this[field]);

		if(arrayutilities.nonEmpty(tokens)){

			arrayutilities.map(tokens, token => {

				let token_value = this.contextHelperController.getFromContext(context, token, false);

				if(!_.isUndefined(token_value) && !_.isNull(token_value)){
					replace_object[token] = token_value;
				}

			});

		}

		let replaced = parserutilities.parse(this[field], replace_object, true);

		return replaced;

	}

}

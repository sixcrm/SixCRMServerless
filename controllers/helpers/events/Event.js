const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const parserutilities = global.SixCRM.routes.include('lib', 'parser-utilities.js');

module.exports = class EventHelperController {

	constructor() {

		this.snsutilities = global.SixCRM.routes.include('lib', 'sns-utilities.js');

		this.topic_arn = 'arn:aws:sns:{{region}}:{{account}}:events';

	}

	pushEvent(event) {

		du.debug('Push Event');

		let publish_parameters = this.createPublishParameters(event);

		return this.snsutilities.publish(publish_parameters);

	}

	createPublishParameters({event_type, context, message_attributes}) {

		du.debug('Create Publish Parameters');

		let user_email = null;

		if (objectutilities.hasRecursive(global, 'user.id') && _.isString(global.user.id)) {
			user_email = global.user.id;
		}

		if (_.isNull(user_email) && _.has(global, 'user') && _.isString(global.user)) {
			user_email = global.user;
		}

		let return_object = {
			Message: JSON.stringify({
				user: user_email,
				account: global.account,
				event_type: event_type,
				context: context
			}),
			TopicArn: this.parseTopicARN()
		};

		return_object = this.addMessageAttributes({return_object: return_object, message_attributes: message_attributes});

		return return_object;

	}

	addMessageAttributes({return_object, message_attributes}){

		du.debug('Add Message Attributes');

		if(_.isUndefined(message_attributes) || _.isNull(message_attributes)){

			return return_object

		}else if(_.isObject(message_attributes)){

			objectutilities.map(message_attributes, (key, value) => {

				if(!_.isString(key)){
					eu.throwError('server', 'Message attribute key must be a string: '+key);
				}

				if(!_.has(value, 'DataType') || !_.isString(value.DataType)){
					eu.throwError('server', 'Message attribute "'+key+'" DataType must be set and of type String.');
				}

				if(!_.has(value, 'StringValue') || !_.isString(value.StringValue)){
					eu.throwError('server', 'Message attribute "'+key+'" DataType must be set and of type String.');
				}

			});

			return_object.MessageAttributes = message_attributes;

			return return_object;

		}

	}

	parseTopicARN() {

		du.debug('Parse Topic ARN');

		return parserutilities.parse(this.topic_arn, {
			//Technical Debt:  These explicit references are a no-no
			account: global.SixCRM.configuration.site_config.aws.account,
			region: this.snsutilities.getRegion()
		});

	}

}

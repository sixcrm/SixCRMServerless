const _ = require('lodash');

const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const eu = require('@sixcrm/sixcrmcore/util/error-utilities').default;
const objectutilities = require('@sixcrm/sixcrmcore/util/object-utilities').default;
const parserutilities = require('@sixcrm/sixcrmcore/util/parser-utilities').default;
const timestamp = require('@sixcrm/sixcrmcore/util/timestamp').default;
const SNSProvider = global.SixCRM.routes.include('controllers', 'providers/sns-provider.js');

module.exports = class EventHelperController {

	constructor() {

		this.snsprovider = new SNSProvider();

		this.topic_arn = 'arn:aws:sns:{{region}}:{{account}}:events';

	}

	pushEvent(event) {

		du.debug('Push Event');

		let publish_parameters = this.createPublishParameters(event);

		return this.snsprovider.publish(publish_parameters);

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
				datetime: timestamp.getISO8601(),
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

			objectutilities.map(message_attributes, (key) => {

				if(!_.isString(key)){
					throw eu.getError('server', 'Message attribute key must be a string: '+key);
				}

				let value = message_attributes[key];

				if(!_.has(value, 'DataType') || !_.isString(value.DataType)){
					throw eu.getError('server', 'Message attribute "'+key+'" DataType must be set and of type String.');
				}

				if(!_.has(value, 'StringValue') || !_.isString(value.StringValue)){
					throw eu.getError('server', 'Message attribute "'+key+'" StringValue must be set and of type String.');
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
			region: this.snsprovider.getRegion()
		});

	}

}

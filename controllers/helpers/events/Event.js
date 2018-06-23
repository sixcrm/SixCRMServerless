const _ = require('lodash');

const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const eu = require('@sixcrm/sixcrmcore/util/error-utilities').default;
const objectutilities = require('@sixcrm/sixcrmcore/util/object-utilities').default;
const parserutilities = require('@sixcrm/sixcrmcore/util/parser-utilities').default;
const stringutilities = require('@sixcrm/sixcrmcore/util/string-utilities').default;
const timestamp = require('@sixcrm/sixcrmcore/util/timestamp').default;
const random = require('@sixcrm/sixcrmcore/util/random').default;
const hashutilities = require('@sixcrm/sixcrmcore/util/hash-utilities').default;

const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
const SNSProvider = global.SixCRM.routes.include('controllers', 'providers/sns-provider.js');

module.exports = class EventHelperController {

	constructor() {

		this.snsprovider = new SNSProvider();

		this.topic_arn = 'arn:aws:sns:{{region}}:{{account}}:events';

	}

	async pushEvent(event) {

		du.debug('Push Event');

		if(!_.has(event, 'context')){
			throw eu.getError('server', 'No context property present');
		}

		if(!_.has(event, 'event_type')){
			throw eu.getError('server', 'No event_type property present.');
		}

		let context = await this.handleContext(event);

		let publish_parameters = this.createPublishParameters(event, context);

		du.info(publish_parameters);

		let result = await this.snsprovider.publish(publish_parameters);

		return result;

	}

	async handleContext({context, event_type}){

		du.debug('Handle Context');

		context = (_.isString(context))?context:JSON.stringify(context);

		const context_size = stringutilities.getBytes(context);

		if(context_size >= 256000){

			du.info('Large Context Object ('+context_size+'), pushing to S3...');
			let context_id = await this.pushContextToS3({event_type: event_type, context: context});
			context = JSON.stringify({s3_reference: context_id});

		}

		return context;

	}

	createPublishParameters({event_type, message_attributes}, context) {

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

		if(!_.isObject(message_attributes)){
			message_attributes = {};
		}

		message_attributes["event_type"] = {"DataType":"String", "StringValue":event_type};

		return_object = this.addMessageAttributes({return_object: return_object, message_attributes: message_attributes});

		return return_object;

	}

	async pushContextToS3({event_type, context}){

		du.debug('Push Context to S3');

		let context_id = event_type+'-'+hashutilities.toSHA1(timestamp.now()+random.createRandomString(20));

		let body = (_.isString(context))?context:JSON.stringify(context);

		await new S3Provider().putObject({
			Bucket: 'sixcrm-'+global.SixCRM.configuration.stage+'-sns-context-objects',
			Key: context_id,
			Body: body
		});

		return context_id;

	}

	addMessageAttributes({return_object, message_attributes}){

		du.debug('Add Message Attributes');

		if(_.isUndefined(message_attributes) || _.isNull(message_attributes)){

			return return_object

		}else if(_.isObject(message_attributes)){

			if(Object.keys(message_attributes).length < 1){
				return return_object;
			}

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
			region: global.SixCRM.configuration.site_config.aws.region
		});

	}

}

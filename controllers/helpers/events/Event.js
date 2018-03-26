const _ = require('underscore');
// const fs = require('fs');
// const uuid = require('uuid');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const parserutilities = global.SixCRM.routes.include('lib', 'parser-utilities.js');

module.exports = class EventHelperController {

	constructor() {

		this.snsutilities = global.SixCRM.routes.include('lib', 'sns-utilities.js');

		this.topic_arn = 'arn:aws:sns:{{region}}:{{account}}:events';

	}

	pushEvent(event) {

		du.debug('Push Event');

		// fs.writeFileSync(event.event_type + '-' + uuid.v4() + '.json', JSON.stringify(event), 'utf8');

		return this.snsutilities.publish(this.createPublishParameters(event));

	}

	createPublishParameters({
		event_type,
		context
	}) {

		du.debug('Create Publish Parameters');

		let user_email = null;

		if (objectutilities.hasRecursive(global, 'user.id') && _.isString(global.user.id)) {
			user_email = global.user.id;
		}

		if (_.isNull(user_email) && _.has(global, 'user') && _.isString(global.user)) {
			user_email = global.user;
		}

		return {
			Message: JSON.stringify({
				user: user_email,
				account: global.account,
				event_type: event_type,
				context: context
			}),
			TopicArn: this.parseTopicARN()
		};

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
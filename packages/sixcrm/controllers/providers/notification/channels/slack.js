const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;
const HttpProvider = require('@6crm/sixcrmcore/lib/providers/http-provider').default;
const httpprovider = new HttpProvider();
const stringutilities = require('@6crm/sixcrmcore/lib/util/string-utilities').default;

const ChannelNotification = global.SixCRM.routes.include('providers', 'notification/components/ChannelNotification.js');

module.exports = class SlackNotification extends ChannelNotification {

	constructor(){

		super();

	}

	validateNotificationProperties(notification_properties){
		if(!stringutilities.isURL(notification_properties)){
			throw eu.getError('server', 'notification_properties must be a valid URL for Slack notifications');
		}

		return true;

	}

	resolveNotification(notification_object, notification_properties) {
		let formatted_slack_notification = this.formatSlackMessage(notification_object);

		return this.triggerWebhookNotification(formatted_slack_notification, notification_properties);

	}

	formatSlackMessage(notification_object) {
		return {
			text: notification_object.title+'\n'+notification_object.body,
			username: "markdownbot",
			mrkdwn: true
		};

	}

	triggerWebhookNotification(notification_object, webhook){
		return httpprovider.postJSON({
			url: webhook,
			body: notification_object
		});

	}

}

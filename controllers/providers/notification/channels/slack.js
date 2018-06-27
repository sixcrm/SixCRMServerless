const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const HttpProvider = global.SixCRM.routes.include('controllers', 'providers/http-provider.js');
const httpprovider = new HttpProvider();
const stringutilities = require('@6crm/sixcrmcore/util/string-utilities').default;

const ChannelNotification = global.SixCRM.routes.include('providers', 'notification/components/ChannelNotification.js');

module.exports = class SlackNotification extends ChannelNotification {

	constructor(){

		super();

	}

	validateNotificationProperties(notification_properties){

		du.debug('Validate Notification Properties');

		if(!stringutilities.isURL(notification_properties)){
			throw eu.getError('server', 'notification_properties must be a valid URL for Slack notifications');
		}

		return true;

	}

	resolveNotification(notification_object, notification_properties) {

		du.debug('Resolve Notification');

		let formatted_slack_notification = this.formatSlackMessage(notification_object);

		return this.triggerWebhookNotification(formatted_slack_notification, notification_properties);

	}

	formatSlackMessage(notification_object) {

		du.debug('Format Message');

		return {
			text: notification_object.title+'\n'+notification_object.body,
			username: "markdownbot",
			mrkdwn: true
		};

	}

	triggerWebhookNotification(notification_object, webhook){

		du.debug('Trigger Webhook Notification');

		return httpprovider.postJSON({
			url: webhook,
			body: notification_object
		});

	}

}

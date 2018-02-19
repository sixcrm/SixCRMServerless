'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');

const AWSDeploymentUtilities = global.SixCRM.routes.include('deployment', 'utilities/aws-deployment-utilities.js');

class SNSDeployment extends AWSDeploymentUtilities {

	constructor() {

		super();

		this.snsutilities = global.SixCRM.routes.include('lib', 'sns-utilities.js');

	}

	createTopics() {

		du.debug('Create Topics');

		let topic_files = fileutilities.getDirectoryFilesSync(global.SixCRM.routes.path('deployment', 'sns/configuration/topics/'));

		if (!_.isArray(topic_files)) {
			eu.throwError('server', 'SNSDeployment.createTopics assumes that the topic_files is an array of file names.');
		}

		let topic_promises = arrayutilities.map(topic_files, (topic_file) => {
			return () => this.createTopic(topic_file);
		});

		return arrayutilities.reduce(topic_promises, (current, topic_promise) => {
			return topic_promise();
		}).then(() => {
			du.output('Complete');
		});

	}

	createTopic(topic_file){

		du.debug('Create Topic');

		let topic_file_contents = global.SixCRM.routes.include('deployment', 'sns/configuration/topics/'+topic_file);

		return this.snsutilities.createTopic(topic_file_contents).then(result => {
			du.debug(result);
		});

	}

	addSubscriptions(){

		du.debug('Add Subscriptions');

		let subscription_files = fileutilities.getDirectoryFilesSync(global.SixCRM.routes.path('deployment', 'sns/configuration/subscriptions/'));

		if (!_.isArray(subscription_files)) {
			eu.throwError('server', 'SNSDeployment.addSubscriptions assumes that the subscription_files is an array of file names.');
		}

		let subscription_promises = arrayutilities.map(subscription_files, (subscription_file) => {
			return () => this.createSubscription(subscription_file);
		});

		return arrayutilities.reduce(subscription_promises, (current, subscription_promise) => {
			return subscription_promise();
		}).then(() => {
			du.output('Complete');
		});

	}

	createSubscription(subscription_file){

		du.debug('Create Subscription');

		let subscription_file_contents = global.SixCRM.routes.include('deployment', 'sns/configuration/subscriptions/'+subscription_file);
		subscription_file_contents = this.parseTokensIntoSubscriptionParameters(subscription_file_contents);

		du.info(subscription_file_contents);
		process.exit();
		return this.snsutilities.subscribe(subscription_file_contents).then(result => {
			du.debug(result);
		});

	}

	parseTokensIntoSubscriptionParameters(subscription_file_contents){

		du.debug('Parse Tokens Into Subscription Parameters');

		let data = {
			region: global.SixCRM.configuration.site_config.aws.region
			account: global.SixCRM.configuration.site_config.aws.account
			topic_name: subscription_file_contents.Name,
		 	stage: global.SixCRM.configuration.stage
		};

		return parserutilities.parse(subscription_file_contents, data)

	}

}

module.exports = new SNSDeployment();

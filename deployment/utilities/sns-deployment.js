const _ = require('lodash');

const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const eu = require('@sixcrm/sixcrmcore/util/error-utilities').default;
const arrayutilities = require('@sixcrm/sixcrmcore/util/array-utilities').default;
const randomutilities = require('@sixcrm/sixcrmcore/util/random').default;
const fileutilities = require('@sixcrm/sixcrmcore/util/file-utilities').default;
const parserutilities = require('@sixcrm/sixcrmcore/util/parser-utilities').default;
const objectutilities = require('@sixcrm/sixcrmcore/util/object-utilities').default;

const AWSDeploymentUtilities = global.SixCRM.routes.include('deployment', 'utilities/aws-deployment-utilities.js');
const SNSProvider = global.SixCRM.routes.include('controllers', 'providers/sns-provider.js');
const SQSProvider = global.SixCRM.routes.include('controllers', 'providers/sqs-provider.js');
const LambdaProvider = global.SixCRM.routes.include('controllers', 'providers/lambda-provider.js');

module.exports = class SNSDeployment extends AWSDeploymentUtilities {

	constructor() {

		super();

		this.sqsProvider = new SQSProvider();
		this.snsprovider = new SNSProvider();
		this.lambdaprovider = new LambdaProvider();

	}

	createTopics() {

		du.debug('Create Topics');

		let topic_files = fileutilities.getDirectoryFilesSync(global.SixCRM.routes.path('deployment', 'sns/configuration/topics/'));

		if (!_.isArray(topic_files)) {
			throw eu.getError('server', 'SNSDeployment.createTopics assumes that the topic_files is an array of file names.');
		}

		let topic_promises = arrayutilities.map(topic_files, (topic_file) => {
			return () => this.createTopic(topic_file);
		});

		return arrayutilities.reduce(topic_promises, (current, topic_promise) => {
			return topic_promise();
		}).then(() => {
			return du.info('Complete');
		});

	}

	createTopic(topic_file) {

		du.debug('Create Topic');

		let topic_file_contents = global.SixCRM.routes.include('deployment', 'sns/configuration/topics/' + topic_file);

		return this.snsprovider.createTopic(topic_file_contents).then(result => {
			return du.debug(result);
		});

	}

	addSubscriptions() {

		du.debug('Add Subscriptions');

		let subscription_files = fileutilities.getDirectoryFilesSync(global.SixCRM.routes.path('deployment', 'sns/configuration/subscriptions/'));

		if (!_.isArray(subscription_files)) {
			throw eu.getError('server', 'SNSDeployment.addSubscriptions assumes that the subscription_files is an array of file names.');
		}

		let subscription_promises = arrayutilities.map(subscription_files, (subscription_file) => {
			return () => this.createSubscriptions(subscription_file);
		});

		return arrayutilities.reduce(subscription_promises, (current, subscription_promise) => {
			return subscription_promise().then(result => {
				return result;
			});
		}).then(() => {
			return du.info('Complete');
		});

	}

	createSubscriptions(subscription_file) {

		du.debug('Create Subscriptions');

		let subscription_file_contents = global.SixCRM.routes.include('deployment', 'sns/configuration/subscriptions/' + subscription_file);

		subscription_file_contents = this.parseTokensIntoSubscriptionParameters(subscription_file_contents);

		return arrayutilities.reduce(subscription_file_contents.Subscriptions, (current, subscription) => {
			return this.subscribe(subscription)
				.then((result) => this.addSubscriptionAttributes(result, subscription))
				.then(() => this.addSubscriptionPermissions(subscription))
				.then((result) => {
					du.debug(result);
					return true;
				});
		}, Promise.resolve());

	}

	async subscribe(subscription) {

		if (subscription.Protocol === 'sqs') {

			subscription.Endpoint = await this.sqsProvider.getQueueARN(subscription.Endpoint);

		}

		return this.snsprovider.subscribe(subscription);

	}

	addSubscriptionAttributes(subscribe_result, subscription) {

		du.debug('Add Subscription Attributes');

		if (!_.has(subscription, 'Attributes') || !arrayutilities.nonEmpty(subscription.Attributes)) {
			return Promise.resolve(true);
		}

		let subscription_attribute_promises = arrayutilities.map(subscription.Attributes, subscription_attribute => {

			let parameters = {
				AttributeName: subscription_attribute.AttributeName,
				SubscriptionArn: this.getSubscriptionARN(subscribe_result),
				AttributeValue: JSON.stringify(subscription_attribute.AttributeValue)
			};

			return this.snsprovider.setSubscriptionAttributes(parameters);

		});

		return Promise.all(subscription_attribute_promises).then(() => {
			return true;
		});

	}

	getSubscriptionARN(subscription_result) {

		du.debug('Get Subscription ARN');

		if (_.has(subscription_result, 'SubscriptionArn')) {
			return subscription_result.SubscriptionArn;
		}

		throw eu.getError('server', 'Unable to identify subscription ARN');

	}

	addSubscriptionPermissions(subscription) {

		du.debug('Add Subscription Permissions');

		let parameters = {
			Action: 'lambda:invokeFunction',
			FunctionName: subscription.Endpoint,
			Principal: 'sns.amazonaws.com',
			SourceArn: subscription.TopicArn,
			StatementId: "snssubscription-" + randomutilities.createRandomString(10)
		};

		return this.lambdaprovider.putPermission(parameters);

	}

	parseTokensIntoSubscriptionParameters(subscription_file_contents) {

		du.debug('Parse Tokens Into Subscription Parameters');

		let data = {
			region: this.snsprovider.getRegion(),
			account: global.SixCRM.configuration.site_config.aws.account,
			stage: global.SixCRM.configuration.stage,
			topic_name: subscription_file_contents.Name
		};

		//Technical Debt:  This assumes that the lambda and the sns topic share the above data
		arrayutilities.map(subscription_file_contents.Subscriptions, (subscription, index) => {
			objectutilities.map(subscription, key => {
				subscription_file_contents.Subscriptions[index][key] = parserutilities.parse(subscription[key], data);
			});
		});

		return subscription_file_contents;

	}

}

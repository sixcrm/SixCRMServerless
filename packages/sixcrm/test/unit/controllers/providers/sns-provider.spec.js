const chai = require('chai');
const expect = chai.expect;

describe('controllers/providers/sns-provider', () => {

	describe('sendSMS', () => {

		it('successfully send SMS', () => {

			let text = 'sample text';

			let phone_number = 123456789;

			const SNSProvider = global.SixCRM.routes.include('controllers', 'providers/sns-provider.js');
			const snsprovider = new SNSProvider();

			snsprovider.sns = {
				publish: (params, callback) => {
					callback(null, 'success');
				}
			};

			return snsprovider.sendSMS(text, phone_number).then((result) => {
				expect(result).to.equal('success');
			});
		});

		it('returns error when SMS sending was unsuccessful', () => {

			let text = 'sample text';

			let phone_number = 123456789;

			const SNSProvider = global.SixCRM.routes.include('controllers', 'providers/sns-provider.js');
			const snsprovider = new SNSProvider();

			snsprovider.sns = {
				publish: (params, callback) => {
					callback(new Error('fail'), null);
				}
			};

			return snsprovider.sendSMS(text, phone_number).catch((error) => {
				expect(error.message).to.equal('fail');
			});
		});
	});

	describe('createTopic', () => {

		it('successfully creates a topic', () => {

			let parameters = {Name: 'a_name'};

			const SNSProvider = global.SixCRM.routes.include('controllers', 'providers/sns-provider.js');
			const snsprovider = new SNSProvider();

			snsprovider.sns = {
				createTopic: (params, callback) => {
					expect(params).to.have.property('Name');
					callback(null, 'success');
				}
			};

			return snsprovider.createTopic(parameters).then((result) => {
				expect(result).to.equal('success');
			});
		});

		it('throws error when topic is not successfully created', () => {

			let parameters = {Name: 'a_name'};

			const SNSProvider = global.SixCRM.routes.include('controllers', 'providers/sns-provider.js');
			const snsprovider = new SNSProvider();

			snsprovider.sns = {
				createTopic: (params, callback) => {
					expect(params).to.have.property('Name');
					callback(new Error('Topic not created'), null);
				}
			};

			return snsprovider.createTopic(parameters).catch((error) => {
				expect(error.message).to.equal('Topic not created');
			});
		});
	});

	describe('addPermission', () => {

		it('successfully adds a permission', () => {

			let parameters = {
				aws_account_id: 'dummy_id',
				action_name: 'an_action_name',
				label: 'a_label',
				topic_arn: 'a_topic_arn'
			};

			const SNSProvider = global.SixCRM.routes.include('controllers', 'providers/sns-provider.js');
			const snsprovider = new SNSProvider();

			snsprovider.sns = {
				addPermission: (params, callback) => {
					expect(params).to.have.property('AWSAccountId');
					expect(params).to.have.property('ActionName');
					expect(params).to.have.property('Label');
					expect(params).to.have.property('TopicArn');
					callback(null, 'success');
				}
			};

			return snsprovider.addPermission(parameters).then((result) => {
				expect(result).to.equal('success');
			});
		});

		it('throws error when permission is not successfully added', () => {

			let parameters = {
				aws_account_id: 'dummy_id',
				action_name: 'an_action_name',
				label: 'a_label',
				topic_arn: 'a_topic_arn'
			};

			const SNSProvider = global.SixCRM.routes.include('controllers', 'providers/sns-provider.js');
			const snsprovider = new SNSProvider();

			snsprovider.sns = {
				addPermission: (params, callback) => {
					expect(params).to.have.property('AWSAccountId');
					expect(params).to.have.property('ActionName');
					expect(params).to.have.property('Label');
					expect(params).to.have.property('TopicArn');
					callback(new Error('Permission not added'), null);
				}
			};

			return snsprovider.addPermission(parameters).catch((error) => {
				expect(error.message).to.equal('Permission not added');
			});
		});
	});

	describe('subscribe', () => {

		it('successfully subscribes', () => {

			let parameters = {
				Protocol: 'a_protocol',
				TopicArn: 'a_topic_arn'
			};

			const SNSProvider = global.SixCRM.routes.include('controllers', 'providers/sns-provider.js');
			const snsprovider = new SNSProvider();

			snsprovider.sns = {
				subscribe: (params, callback) => {
					expect(params).to.have.property('Protocol');
					expect(params).to.have.property('TopicArn');
					callback(null, 'success');
				}
			};

			return snsprovider.subscribe(parameters).then((result) => {
				expect(result).to.equal('success');
			});
		});

		it('throws error when subscription was not successful', () => {

			let parameters = {
				Protocol: 'a_protocol',
				TopicArn: 'a_topic_arn'
			};

			const SNSProvider = global.SixCRM.routes.include('controllers', 'providers/sns-provider.js');
			const snsprovider = new SNSProvider();

			snsprovider.sns = {
				subscribe: (params, callback) => {
					expect(params).to.have.property('Protocol');
					expect(params).to.have.property('TopicArn');
					callback(new Error('Subscription unsuccessful'), null);
				}
			};

			return snsprovider.subscribe(parameters).catch((error) => {
				expect(error.message).to.equal('Subscription unsuccessful');
			});
		});
	});

	describe('publish', () => {

		it('successfully publishes', () => {

			let parameters = {
				Message: 'a_message'
			};

			const SNSProvider = global.SixCRM.routes.include('controllers', 'providers/sns-provider.js');
			const snsprovider = new SNSProvider();

			snsprovider.sns = {
				publish: (params) => {
					expect(params).to.have.property('Message')
					return {
						promise: () => {
							return Promise.resolve('success')
						}
					}
				}
			};

			return snsprovider.publish(parameters).then((result) => {
				expect(result).to.equal('success');
			});
		});

		it('throws error when publish was not successful', () => {

			let parameters = {
				Message: 'a_message'
			};

			const SNSProvider = global.SixCRM.routes.include('controllers', 'providers/sns-provider.js');
			const snsprovider = new SNSProvider();

			snsprovider.sns = {
				publish: (params) => {
					expect(params).to.have.property('Message')
					return {
						promise: () => {
							return Promise.resolve('Publish failed')
						}
					}
				}
			};

			return snsprovider.publish(parameters).catch((error) => {
				expect(error.message).to.equal('Publish failed');
			});
		});
	});
});

const mockery = require('mockery');
let chai = require('chai');

let expect = chai.expect;
let objectutilities = require('@sixcrm/sixcrmcore/util/object-utilities').default;
let PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');
const timestamp = require('@sixcrm/sixcrmcore/util/timestamp').default;

describe('helpers/events/Event.spec.js', () => {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	beforeEach(() => {
		mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
			sendMessage() {
				return Promise.resolve(true);
			}
		});

		mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sns-provider.js'), class {
			publish() {
				return Promise.resolve({});
			}
			getRegion() {
				return 'us-east-1';
			}
		});
	});

	afterEach(() => {
		mockery.resetCache();
	});

	after(() => {
		mockery.deregisterAll();
	});

	describe('constructor', () => {

		it('successfully constructs', () => {

			const EventHelperController = global.SixCRM.routes.include('helpers', 'events/Event.js');
			let eventHelperController = new EventHelperController();

			expect(objectutilities.getClassName(eventHelperController)).to.equal('EventHelperController');
		});

	});

	describe('parseTopicARN', () => {

		it('successfully generates a valid topic ARN', () => {

			const EventHelperController = global.SixCRM.routes.include('helpers', 'events/Event.js');
			let eventHelperController = new EventHelperController();

			let topic_arn = eventHelperController.parseTopicARN();

			//Technical Debt:  Bad to make hard references to the config like this...
			expect(topic_arn).to.equal('arn:aws:sns:' + global.SixCRM.configuration.site_config.aws.region + ':' + global.SixCRM.configuration.site_config.aws.account + ':events');

		});

	});

	describe('createPublishParameters', () => {

		PermissionTestGenerators.givenUserWithAllowed('*', '*', '*');

		it('succesfully creates publishing parameters', () => {

			const EventHelperController = global.SixCRM.routes.include('helpers', 'events/Event.js');
			let eventHelperController = new EventHelperController();

			let input_object = {
				event_type: 'initial_order',
				context: {
					something: 'isnice'
				}
			};

			let expected_response = {
				user: global.user.id,
				datetime: "2018-03-29T17:15:38.859Z",
				account: global.account,
				event_type: input_object.event_type,
				context: input_object.context
			};

			let parameters = eventHelperController.createPublishParameters(input_object);

			expect(parameters).to.have.property('Message');
			expect(parameters).to.have.property('TopicArn');

			const message = JSON.parse(parameters.Message);
			expect(message).to.have.property('datetime');
			expect(timestamp.isISO8601(message.datetime));

			// we have to set the datetime to the expected response since it would return the current date time
			message.datetime = "2018-03-29T17:15:38.859Z";

			expect(message).to.eql(expected_response);

		});

	});

	describe('pushEvent', () => {

		it('successfully pushes a event to a SNS topic', () => {

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sns-provider.js'), class {
				publish() {
					return Promise.resolve({
						MessageId: "e0701729-c444-5c95-b3dd-442caf4b8dbe",
						ResponseMetadata: {
							RequestId: "a7adb36f-c590-5fb2-89a1-e06aae9e9e99"
						}
					})
				}
				getRegion() {
					return 'us-east-1';
				}
			});

			const EventHelperController = global.SixCRM.routes.include('helpers', 'events/Event.js');
			let eventHelperController = new EventHelperController();

			let input_object = {
				event_type: 'initial_order',
				context: {
					something: 'isnice'
				}
			};

			return eventHelperController.pushEvent(input_object).then(result => {
				expect(result).to.have.property('MessageId');
				expect(result).to.have.property('ResponseMetadata');
				expect(result.ResponseMetadata).to.have.property('RequestId');
			});

		});

	});

	describe('addMessageAttributes', () => {

		it('returns unchanged forwarded object when message attributes are undefined', () => {

			let params = {
            	return_object: {}
			};

			const EventHelperController = global.SixCRM.routes.include('helpers', 'events/Event.js');
			let eventHelperController = new EventHelperController();

			expect(eventHelperController.addMessageAttributes(params)).to.equal(params.return_object);
		});

		it('adds message attributes to forwarded object', () => {

			let params = {
            	return_object: {},
				message_attributes: {
					'event_type': {
						DataType:'String',
						StringValue: 'initial_order'
					}
				}
			};

			const EventHelperController = global.SixCRM.routes.include('helpers', 'events/Event.js');
			let eventHelperController = new EventHelperController();

			expect(eventHelperController.addMessageAttributes(params)).to.deep.equal({
				MessageAttributes: params.message_attributes
			});
		});

		it('throws error when "DataType" is not set', () => {

			let params = {
            	return_object: {},
				message_attributes: {
					'event_type': {
						StringValue: 'initial_order'
					}
				}
			};

			const EventHelperController = global.SixCRM.routes.include('helpers', 'events/Event.js');
			let eventHelperController = new EventHelperController();

			try {
				eventHelperController.addMessageAttributes(params);
			} catch (error) {
				expect(error.message).to.equal("[500] Message attribute \"event_type\" DataType must be set and of type String.");
			}
		});

		it('throws error when "StringValue" is not set', () => {

			let params = {
            	return_object: {},
				message_attributes: {
					'event_type': {
						DataType:'String'
					}
				}
			};

			const EventHelperController = global.SixCRM.routes.include('helpers', 'events/Event.js');
			let eventHelperController = new EventHelperController();

			try {
				eventHelperController.addMessageAttributes(params);
			} catch (error) {
				expect(error.message).to.equal("[500] Message attribute \"event_type\" StringValue must be set and of type String.");
			}
		});

		it('returns undefined when message attributes are not an object', () => {

			let params = {
				return_object: {},
				message_attributes: ''
			};

			const EventHelperController = global.SixCRM.routes.include('helpers', 'events/Event.js');
			let eventHelperController = new EventHelperController();

			expect(eventHelperController.addMessageAttributes(params)).to.equal(undefined);
		});

	});

});

const mockery = require('mockery');
let chai = require('chai');

let expect = chai.expect;
let objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
let random = require('@6crm/sixcrmcore/util/random').default;
let PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');
const timestamp = require('@6crm/sixcrmcore/util/timestamp').default;

describe('helpers/events/Event.spec.js', () => {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	beforeEach(() => {

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
		mockery.disable();
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

			let parameters = eventHelperController.createPublishParameters(input_object, input_object.context);

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

	describe('handleContext', async () => {

		it('returns a context string', async () => {

			const context = {
				this:'is',
				a:{},
				context_object:['ya', 'heard']
			};

			const event_type = 'some_event_type';

			const EventHelperController = global.SixCRM.routes.include('helpers', 'events/Event.js');
			let eventHelperController = new EventHelperController();

			let result = await eventHelperController.handleContext({context: context, event_type: event_type});
			expect(result).to.equal(JSON.stringify(context));

		});

		it('throws an error if missing context object', async () => {

			const event_type = 'some_event_type';

			const EventHelperController = global.SixCRM.routes.include('helpers', 'events/Event.js');
			let eventHelperController = new EventHelperController();

			try{
				await eventHelperController.handleContext({event_type: event_type});
				expect(true).to.equal(false);
			}catch(error){
				expect(error.message).to.equal('[500] StringUtilities.isString thing argument is not an string.');
			}

		});

		it('throws an error if missing context object', async () => {

			const context = { large_context_object: random.createRandomString(300000)};
			const event_type = 'some_event_type';

			mockery.registerMock(global.SixCRM.routes.path('providers', 's3-provider.js'), class{
				putObject({Key, Body, Bucket}){
					expect(Key).to.be.a('string');
					expect(Body).to.be.a('string');
					expect(Bucket).to.be.a('string');
					return Promise.resolve(true);
				}
			});

			const EventHelperController = global.SixCRM.routes.include('helpers', 'events/Event.js');
			let eventHelperController = new EventHelperController();

			let result = await eventHelperController.handleContext({context: context, event_type: event_type});
			expect(JSON.parse(result)).to.have.property('s3_reference');

		});

	});

	describe('pushContextToS3', async () => {

		it('returns a context id', async () => {

			let event = {
				event_type: 'someventtype',
				context: {some: 'context'}
			};

			mockery.registerMock(global.SixCRM.routes.path('providers', 's3-provider.js'), class{
				putObject({Key, Body, Bucket}){
					expect(Key).to.be.a('string');
					expect(Body).to.be.a('string');
					expect(Bucket).to.be.a('string');
					return Promise.resolve(true);
				}
			});

			const EventHelperController = global.SixCRM.routes.include('helpers', 'events/Event.js');
			let eventHelperController = new EventHelperController();

			let result = await eventHelperController.pushContextToS3(event);
			expect(result).to.be.a('string');
			expect(result).to.have.string(event.event_type+'-');

		});

		it('returns a context id (string context)', async () => {

			let event = {
				event_type: 'someventtype',
				context: JSON.stringify({some: 'context'})
			};

			mockery.registerMock(global.SixCRM.routes.path('providers', 's3-provider.js'), class{
				putObject({Key, Body, Bucket}){
					expect(Key).to.be.a('string');
					expect(Body).to.be.a('string');
					expect(Bucket).to.be.a('string');
					return Promise.resolve(true);
				}
			});

			const EventHelperController = global.SixCRM.routes.include('helpers', 'events/Event.js');
			let eventHelperController = new EventHelperController();

			let result = await eventHelperController.pushContextToS3(event);
			expect(result).to.be.a('string');
			expect(result).to.have.string(event.event_type+'-');

		});

	});

	/*
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
	*/
	/*
	async handleContext({context, event_type}){

		du.debug('Handle Context');

		context = (_.isString(context))?context:JSON.stringify(context);

		const context_size = stringutilities.getBytes(context);

		if(context_size >= 256){

			du.info('Large Context Object, pushing to S3...');
			let context_id = await this.pushContextToS3({event_type: event_type, context: context});
			context = JSON.stringify({s3_reference: context_id});

		}

		return context;

	}
	*/

	xdescribe('pushEvent (LIVE)', async () => {

		it('successfully pushes a event to a SNS topic', async () => {

			mockery.deregisterAll();

			const EventHelperController = global.SixCRM.routes.include('helpers', 'events/Event.js');
			let eventHelperController = new EventHelperController();

			let input_object = {
				event_type: 'test',
				context: {
					something: 'This is a context object!'
				}
			};

			let result = await eventHelperController.pushEvent(input_object);

			console.log(result);

			expect(result).to.have.property('MessageId');
			expect(result).to.have.property('ResponseMetadata');
			expect(result.ResponseMetadata).to.have.property('RequestId');

		});

	});

});


const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');

const arrayutilities = require('@6crm/sixcrmcore/lib/util/array-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/lib/util/object-utilities').default;

const MockEntities = global.SixCRM.routes.include('test','mock-entities.js');

function getValidEvent(){

	return {
		"Records": [{
			"EventSource": "aws:sns",
			"EventVersion": "1.0",
			"EventSubscriptionArn": "arn:aws:sns:us-east-1:068070110666:events:a7edf34e-55b5-4b1e-9820-47d6d71faeb6",
			"Sns": {
				"Type": "Notification",
				"MessageId": "1c1e947a-f7ec-50f2-a4f1-c7df218c2a41",
				"TopicArn": "arn:aws:sns:us-east-1:068070110666:events",
				"Subject": null,
				"Message": "{\"user\":\"tmdalbey@gmail.com\",\"event_type\":\"test\",\"datetime\":\"2018-06-21T16:36:47.949Z\",\"context\":\"{\\\"id\\\":\\\"d8beed76-bbe2-4a28-a626-658bfb33d7d1\\\",\\\"testing\\\":\\\"This is a test\\\",\\\"account\\\":\\\"d3fa3bf3-7824-49f4-8261-87674482bf1c\\\",\\\"user\\\":{\\\"id\\\":\\\"tmdalbey@gmail.com\\\"}}\"}",
				"Timestamp": "2018-06-21T16:36:48.857Z",
				"SignatureVersion": "1",
				"Signature": "MofT1Rt+AQ8nCtz1nUxZr1Ea8YNPjWfpqemZdwsvr7a1GbCoatk6Fs/5Sy5BNqbtsiM/A2OOgjOuDr8DtUzLuswHqlYAIh4m8O3hAFtAI5CPs+/scOe9603+88dcHPc/eDcujHR9mpY8G7OYP9SYXE8hrwRR5YDjoSC5WYWhjY8UeKyuyQhu1ZMYt0Yd61ihZTEPeYDcpxemmACi/HbT993aX7OsA0lgLD/rFDe2bK75CHH+JNbs/sCL7KICvPuE2Jkc+9X/IZCr34366Vx74lAvtJqKf5paE967ifNBh55mlguyUTtgjBswB+PklC8JL4c4k5NOL5fGzwexzGdxHA==",
				"SigningCertUrl": "https://sns.us-east-1.amazonaws.com/SimpleNotificationService-eaea6120e66ea12e88dcd8bcbddca752.pem",
				"UnsubscribeUrl": "https://sns.us-east-1.amazonaws.com/?Action=Unsubscribe&SubscriptionArn=arn:aws:sns:us-east-1:068070110666:events:a7edf34e-55b5-4b1e-9820-47d6d71faeb6",
				"MessageAttributes": {}
			}
		}]
	};

}

describe('controllers/workers/snsevents/notificationEvents.js', () => {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
		mockery.resetCache();
		mockery.deregisterAll();
	});

	afterEach(() => {
		mockery.resetCache();
		mockery.deregisterAll();
	});

	after(() => {
		mockery.disable();
	});

	describe('constructor', () => {

		it('instantiates the trackingEventsController class', () => {

			const NotificationEventsController = global.SixCRM.routes.include('controllers', 'workers/snsevent/notificationEvents.js');
			let notificationEventsController = new NotificationEventsController();

			expect(objectutilities.getClassName(notificationEventsController)).to.equal('NotificationEventsController');

		});

	});

	describe('getContext', async () => {

		it('successfully retrieves context from the message', async () => {

			let record = getValidEvent().Records[0];
			let message = JSON.parse(record.Sns.Message);


			const NotificationEventsController = global.SixCRM.routes.include('controllers', 'workers/snsevent/notificationEvents.js');
			let notificationEventsController = new NotificationEventsController();

			let result = await notificationEventsController.getContext(message);
			expect(result).to.have.property('id');
			expect(result).to.have.property('user');
			expect(result).to.have.property('account');

		});

	});

	describe('execute', () => {

		it('successfully executes against valid event',  () => {

			let event = getValidEvent();

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'notifications/Notification.js'), class {
				constructor(){}
				executeNotifications({context, event_type}){
					expect(event_type).to.equal('test')
					return Promise.resolve(true);
				}
			});

			const NotificationEventsController = global.SixCRM.routes.include('controllers', 'workers/snsevent/notificationEvents.js');
			let notificationEventsController = new NotificationEventsController();

			return notificationEventsController.execute(event);

		});

		it('successfully executes against cases', () => {

			let session  = MockEntities.getValidSession('668ad918-0d09-4116-a6fe-0e8a9eda36f7');

			let test_cases = [
				{
					message: {
						event_type:'lead',
						account:'d3fa3bf3-7824-49f4-8261-87674482bf1c',
						user:"system@sixcrm.com",
						context:{
							session: session
						}
					}
				}
			];

			return arrayutilities.reduce(test_cases, (current, test_case) => {

				let sns_message = MockEntities.getValidSNSMessage(test_case.message);

				mockery.registerMock(global.SixCRM.routes.path('helpers', 'notifications/Notification.js'), class {
					constructor(){}
					executeNotifications(){
						return Promise.resolve(true);
					}
				});

				const NotificationEventsController = global.SixCRM.routes.include('controllers', 'workers/snsevent/notificationEvents.js');
				let notificationEventsController = new NotificationEventsController();

				return notificationEventsController.execute(sns_message);

			}, null);

		});

		it('successfully executes against cases', () => {

			let session  = MockEntities.getValidSession('668ad918-0d09-4116-a6fe-0e8a9eda36f7');

			let test_cases = [
				{
					message: {
						event_type:'lead',
						account:'d3fa3bf3-7824-49f4-8261-87674482bf1c',
						user:"system@sixcrm.com",
						context:{
							s3_reference:'somereference'
						}
					}
				}
			];

			return arrayutilities.reduce(test_cases, (current, test_case) => {

				let sns_message = MockEntities.getValidSNSMessage(test_case.message);

				mockery.registerMock(global.SixCRM.routes.path('helpers', 'notifications/Notification.js'), class {
					constructor(){}
					executeNotifications(){
						return Promise.resolve(true);
					}
				});

				mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/s3-provider.js'), class {
					constructor(){}
					getObject(bucket, key){
						expect(bucket).to.be.a('string');
						expect(key).to.be.a('string');
						expect(key).to.equal('somereference');
						expect(bucket).to.have.string('sns-context-objects');
						return Promise.resolve(JSON.stringify({some: 'object'}));
					}

				});

				const NotificationEventsController = global.SixCRM.routes.include('controllers', 'workers/snsevent/notificationEvents.js');
				let notificationEventsController = new NotificationEventsController();

				return notificationEventsController.execute(sns_message);

			}, null);

		});

	});

});

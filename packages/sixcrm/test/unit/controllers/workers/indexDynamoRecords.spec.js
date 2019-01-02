const _ = require('lodash');
const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');

const timestamp = require('@6crm/sixcrmcore/util/timestamp').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;

const MockEntities = global.SixCRM.routes.include('test','mock-entities.js');

function getTestEvent(){

	return {
		"Records": [{
			"eventID": "736d4a57e8331716650c51a70af91239",
			"eventName": "INSERT",
			"eventVersion": "1.1",
			"eventSource": "aws:dynamodb",
			"awsRegion": "us-east-1",
			"dynamodb": {
				"ApproximateCreationDateTime": 1529287860,
				"Keys": {
					"id": {
						"S": "b5803b28-c584-4bb3-8fac-3315b91686b3"
					}
				},
				"NewImage": {
					"default_creditcard": {
						"S": "df84f7bb-06bd-4daa-b1a3-6a2c113edd72"
					},
					"firstname": {
						"S": "Test_b5803b28-c584-4bb3-8fac-3315b91686b3"
					},
					"address": {
						"M": {
							"zip": {
								"S": "97213"
							},
							"country": {
								"S": "US"
							},
							"city": {
								"S": "Portland"
							},
							"state": {
								"S": "OR"
							},
							"line2": {
								"S": "Apartment 3"
							},
							"line1": {
								"S": "123 Test St."
							}
						}
					},
					"updated_at": {
						"S": "2018-06-18T02:11:54.609Z"
					},
					"phone": {
						"S": "1234567890"
					},
					"creditcards": {
						"L": [{
							"S": "df84f7bb-06bd-4daa-b1a3-6a2c113edd72"
						}]
					},
					"created_at": {
						"S": "2018-06-18T02:11:54.609Z"
					},
					"id": {
						"S": "b5803b28-c584-4bb3-8fac-3315b91686b3"
					},
					"account": {
						"S": "d3fa3bf3-7824-49f4-8261-87674482bf1c"
					},
					"email": {
						"S": "test@test.com"
					},
					"lastname": {
						"S": "Test"
					}
				},
				"SequenceNumber": "290287400000000002661880813",
				"SizeBytes": 472,
				"StreamViewType": "NEW_AND_OLD_IMAGES"
			},
			"eventSourceARN": "arn:aws:dynamodb:us-east-1:068070110666:table/customers/stream/2018-06-17T00:56:35.300"
		}]
	};

}

describe('controllers/workers/indexDynamoRecords.js', () => {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	afterEach(() => {
		mockery.resetCache();
		mockery.deregisterAll();
	});

	after(() => {
		mockery.disable();
	});

	describe('constructor', () => {
		it('successfully executes the constructor', () => {

			const IndexDynamoRecordsController = global.SixCRM.routes.include('controllers', 'workers/indexDynamoRecords.js');
			let indexDynamoRecordsController = new IndexDynamoRecordsController();

			expect(objectutilities.getClassName(indexDynamoRecordsController)).to.equal('IndexDynamoRecordsController');

		});
	});

	describe('getIndexingAction', () => {
		it('successfully identifies the indexing action (add - INSERT)', () => {

			let record = (getTestEvent()).Records[0];

			const IndexDynamoRecordsController = global.SixCRM.routes.include('controllers', 'workers/indexDynamoRecords.js');
			let indexDynamoRecordsController = new IndexDynamoRecordsController();

			let result = indexDynamoRecordsController.getIndexingAction(record);
			expect(result).to.equal('add');

		});

		it('successfully identifies the indexing action (add - MODIFY)', () => {

			let record = (getTestEvent()).Records[0];
			record.eventName = 'MODIFY';

			const IndexDynamoRecordsController = global.SixCRM.routes.include('controllers', 'workers/indexDynamoRecords.js');
			let indexDynamoRecordsController = new IndexDynamoRecordsController();

			let result = indexDynamoRecordsController.getIndexingAction(record);
			expect(result).to.equal('add');

		});

		it('successfully identifies the indexing action (delete - REMOVE)', () => {

			let record = (getTestEvent()).Records[0];
			record.eventName = 'REMOVE';

			const IndexDynamoRecordsController = global.SixCRM.routes.include('controllers', 'workers/indexDynamoRecords.js');
			let indexDynamoRecordsController = new IndexDynamoRecordsController();

			let result = indexDynamoRecordsController.getIndexingAction(record);
			expect(result).to.equal('delete');

		});

		it('returns null (bad eventName)', () => {

			let record = (getTestEvent()).Records[0];
			record.eventName = 'somegarbage';

			const IndexDynamoRecordsController = global.SixCRM.routes.include('controllers', 'workers/indexDynamoRecords.js');
			let indexDynamoRecordsController = new IndexDynamoRecordsController();

			let result = indexDynamoRecordsController.getIndexingAction(record);
			expect(result).to.equal(null);

		});

		it('returns null (missing eventName)', () => {

			let record = (getTestEvent()).Records[0];
			delete record.eventName;

			const IndexDynamoRecordsController = global.SixCRM.routes.include('controllers', 'workers/indexDynamoRecords.js');
			let indexDynamoRecordsController = new IndexDynamoRecordsController();

			let result = indexDynamoRecordsController.getIndexingAction(record);
			expect(result).to.equal(null);

		});

	});

	describe('getEntityType', () => {
		it('successfully identifies the entity type (customer)', () => {

			let record = (getTestEvent()).Records[0];

			const IndexDynamoRecordsController = global.SixCRM.routes.include('controllers', 'workers/indexDynamoRecords.js');
			let indexDynamoRecordsController = new IndexDynamoRecordsController();

			let result = indexDynamoRecordsController.getEntityType(record);
			expect(result).to.equal('customer');

		});

		it('successfully identifies the entity type (product)', () => {

			let record = (getTestEvent()).Records[0];
			record.eventSourceARN = 'arn:aws:dynamodb:us-east-1:068070110666:table/products/stream/2018-06-17T00:56:35.300';

			const IndexDynamoRecordsController = global.SixCRM.routes.include('controllers', 'workers/indexDynamoRecords.js');
			let indexDynamoRecordsController = new IndexDynamoRecordsController();

			let result = indexDynamoRecordsController.getEntityType(record);
			expect(result).to.equal('product');

		});

		it('returns null (missing eventSourceARN)', () => {

			let record = (getTestEvent()).Records[0];
			delete record.eventSourceARN

			const IndexDynamoRecordsController = global.SixCRM.routes.include('controllers', 'workers/indexDynamoRecords.js');
			let indexDynamoRecordsController = new IndexDynamoRecordsController();

			let result = indexDynamoRecordsController.getEntityType(record);
			expect(result).to.equal(null);

		});

		it('returns null (bad eventSourceARN structure)', () => {

			let record = (getTestEvent()).Records[0];
			record.eventSourceARN = 'ajsdijaiwdwioad';

			const IndexDynamoRecordsController = global.SixCRM.routes.include('controllers', 'workers/indexDynamoRecords.js');
			let indexDynamoRecordsController = new IndexDynamoRecordsController();

			let result = indexDynamoRecordsController.getEntityType(record);
			expect(result).to.equal(null);

		});

	});

});

const _ = require('lodash');
const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');

const timestamp = require('@sixcrm/sixcrmcore/util/timestamp').default;
const objectutilities = require('@sixcrm/sixcrmcore/util/object-utilities').default;
const arrayutilities = require('@sixcrm/sixcrmcore/util/array-utilities').default;

const MockEntities = global.SixCRM.routes.include('test','mock-entities.js');

function getTestEvent(){

	return {
		"Records": [{
				"eventID": "1",
				"eventName": "INSERT",
				"eventVersion": "1.0",
				"eventSource": "aws:dynamodb",
				"awsRegion": "us-east-1",
				"dynamodb": {
					"Keys": {
						"Id": {
							"N": "101"
						}
					},
					"NewImage": {
						"Message": {
							"S": "New item!"
						},
						"Id": {
							"N": "101"
						}
					},
					"SequenceNumber": "111",
					"SizeBytes": 26,
					"StreamViewType": "NEW_AND_OLD_IMAGES"
				},
				"eventSourceARN": "stream-ARN"
			},
			{
				"eventID": "2",
				"eventName": "MODIFY",
				"eventVersion": "1.0",
				"eventSource": "aws:dynamodb",
				"awsRegion": "us-east-1",
				"dynamodb": {
					"Keys": {
						"Id": {
							"N": "101"
						}
					},
					"NewImage": {
						"Message": {
							"S": "This item has changed"
						},
						"Id": {
							"N": "101"
						}
					},
					"OldImage": {
						"Message": {
							"S": "New item!"
						},
						"Id": {
							"N": "101"
						}
					},
					"SequenceNumber": "222",
					"SizeBytes": 59,
					"StreamViewType": "NEW_AND_OLD_IMAGES"
				},
				"eventSourceARN": "stream-ARN"
			},
			{
				"eventID": "3",
				"eventName": "REMOVE",
				"eventVersion": "1.0",
				"eventSource": "aws:dynamodb",
				"awsRegion": "us-east-1",
				"dynamodb": {
					"Keys": {
						"Id": {
							"N": "101"
						}
					},
					"OldImage": {
						"Message": {
							"S": "This item has changed"
						},
						"Id": {
							"N": "101"
						}
					},
					"SequenceNumber": "333",
					"SizeBytes": 38,
					"StreamViewType": "NEW_AND_OLD_IMAGES"
				},
				"eventSourceARN": "stream-ARN"
			}
		]
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

	describe('constructor', () => {
		it('successfully executes the constructor', () => {

			const IndexDynamoRecordsController = global.SixCRM.routes.include('controllers', 'workers/indexDynamoRecords.js');
			let indexDynamoRecordsController = new IndexDynamoRecordsController();

			expect(objectutilities.getClassName(indexDynamoRecordsController)).to.equal('IndexDynamoRecordsController');

		});
	});

});

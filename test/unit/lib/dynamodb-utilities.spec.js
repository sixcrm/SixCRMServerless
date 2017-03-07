let DynamoDBUtilities = require('../../../lib/dynamodb-utilities');
let chai = require('chai');
let expect = chai.expect;

let anyItem = { property: 'value' };
let anyTableName = 'tableName';

describe('lib/dynamodb-utilities', () => {
    describe('dynamodb-utilities', () => {

        it('should save a record', (done) => {
            // given
            let anItem = anyItem;
            let aTableName = anyTableName;
            DynamoDBUtilities.dynamodb =  {
                put: (params, callback) => {
                    callback(null, params);
                }
            };

            // when
            DynamoDBUtilities.saveRecord(aTableName, anItem, (err, data) => {
                // then
                expect(data).to.deep.equal({
                    TableName: aTableName,
                    Item: anItem
                });
                done();
            });
        });

        it('should throw an error if saving fails', (done) => {
            // given
            let anItem = anyItem;
            let aTableName = anyTableName;
            DynamoDBUtilities.dynamodb = {
                put: (params, callback) => {
                    callback(new Error('An error occurred.'), 'A stacktrace.');
                }
            };

            // when
            DynamoDBUtilities.saveRecord(aTableName, anItem, (err, data) => {
                // then
                expect(err).to.be.an('Error');
                done();
            });
        });

        it('should scan records', (done) => {
            // given
            let aTableName = anyTableName;
            let anyResults = { Items: [{ a: 'b' }, { c: 'd' }]};
            let anyParams = {};
            DynamoDBUtilities.dynamodb = {
                scan: (params, callback) => {
                    callback(null, anyResults);
                }
            };

            // when
            DynamoDBUtilities.scanRecords(aTableName, anyParams, (err, data) => {
                // then
                expect(data).to.deep.equal(anyResults.Items);

                DynamoDBUtilities.scanRecordsFull(aTableName, anyParams, (err, data) => {
                    expect(data).to.deep.equal(anyResults);
                    done();
                });
            });
        });

        it('should return empty results when no records', (done) => {
            // given
            let aTableName = anyTableName;
            let anyResults = { Items: [] };
            let anyParams = {};
            DynamoDBUtilities.dynamodb = {
                scan: (params, callback) => {
                    callback(null, anyResults);
                }
            };

            // when
            DynamoDBUtilities.scanRecords(aTableName, anyParams, (err, data) => {
                // then
                expect(data).to.deep.equal(anyResults.Items);
                done();
            });
        });

        it('should retain limits when scanning records', (done) => {
            // given
            let aTableName = anyTableName;
            let anyResults = { Items: [{ a: 'b' }, { c: 'd' }]};
            let paramsWithLimit = { limit: 1 };
            DynamoDBUtilities.dynamodb = {
                scan: (params, callback) => {
                    expect(params.Limit).to.equal(paramsWithLimit.limit);
                    callback(null, anyResults);
                }
            };

            // when
            DynamoDBUtilities.scanRecords(aTableName, paramsWithLimit, (err, data) => {
                // then
                expect(data).to.deep.equal(anyResults.Items);
                done();
            });
        });

        it('should throw an error if scanning fails', (done) => {
            // given
            let anItem = anyItem;
            let aTableName = anyTableName;
            DynamoDBUtilities.dynamodb = {
                scan: (params, callback) => {
                    callback(new Error('An error occurred.'), 'A stacktrace.');
                }
            };

            // when
            DynamoDBUtilities.scanRecords(aTableName, anItem, (err, data) => {
                // then
                expect(err).to.be.an('Error');
                done();
            });
        });

        it('should query records', (done) => {
            // given
            let aTableName = anyTableName;
            let anyResults = { Items: [{ a: 'b' }, { c: 'd' }]};
            let anyParams = {};
            let anyConditionExpression = '';

            DynamoDBUtilities.dynamodb = {
                query: (params, callback) => {
                    callback(null, anyResults);
                }
            };

            // when
            DynamoDBUtilities.queryRecords(aTableName, anyParams, anyIndex = 0, (err, data) => {
                // then
                expect(data).to.deep.equal(anyResults.Items);
                done();
            });
        });

        it('should update records', (done) => {
            // given
            let aTableName = anyTableName;
            let anyParams = {};

            DynamoDBUtilities.dynamodb = {
                update: (params, callback) => {
                    callback(null, params);
                }
            };

            // when
            DynamoDBUtilities.updateRecord(aTableName, anyKey = '1', anyExpression = '', anyParams, (err, data) => {
                // then
                expect(data).to.deep.equal({
                    ExpressionAttributeValues: {},
                    Key: anyKey,
                    ReturnValues: 'UPDATED_NEW',
                    TableName: aTableName,
                    UpdateExpression: ''
                });
                done();
            });
        });

        it('should delete a record', (done) => {
            // given
            let aTableName = anyTableName;
            let anyParams = {};

            DynamoDBUtilities.dynamodb = {
                delete: (params, callback) => {
                    callback(null, params);
                }
            };

            // when
            DynamoDBUtilities.deleteRecord(aTableName, anyKey = '1', anyExpression = '', anyParams, (err, data) => {
                // then
                expect(data).to.deep.equal({
                    TableName: aTableName,
                    Key: anyKey,
                    ConditionExpression: anyExpression,
                    ExpressionAttributeValues: {}
                });
                done();
            });
        });
    });
});

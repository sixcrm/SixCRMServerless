let DynamoDBUtilities = require('../../../lib/dynamodb-utilities');
let chai = require('chai');
let expect = chai.expect;

let anyItem = { property: 'value' };
let anyTableName = 'tableName';

const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

describe('lib/dynamodb-utilities', () => {
    describe('dynamodb-utilities', () => {

        xit('should save a record', (done) => {
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

        xit('should throw an error if saving fails', (done) => {
            // given
            let anItem = anyItem;
            let aTableName = anyTableName;

            DynamoDBUtilities.dynamodb = {
                put: (params, callback) => {
                    callback(eu.getError('server','An error occurred.'), 'A stacktrace.');
                }
            };

            // when
            DynamoDBUtilities.saveRecord(aTableName, anItem, (err, data) => {
                // then
                expect(err).to.be.an('Error');
                done();
            });
        });

        xit('should scan records', (done) => {
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

        xit('should return empty results when no records', (done) => {
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

        xit('should retain limits when scanning records', (done) => {
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

        xit('should throw an error if scanning fails', (done) => {
            // given
            let anItem = anyItem;
            let aTableName = anyTableName;

            DynamoDBUtilities.dynamodb = {
                scan: (params, callback) => {
                    callback(eu.getError('server','An error occurred.'), 'A stacktrace.');
                }
            };

            // when
            DynamoDBUtilities.scanRecords(aTableName, anItem, (err, data) => {
                // then
                expect(err).to.be.an('Error');
                done();
            });
        });

        xit('should query records', (done) => {
            // given
            let aTableName = anyTableName;
            let anyResults = { Items: [{ a: 'b' }, { c: 'd' }]};
            let anyParams = {};
            let anyConditionExpression = '';
            let anyIndex = 0;

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

        xit('should count records', (done) => {
            // given
            let aTableName = anyTableName;
            let anyResults = { Count: 2};
            let anyParams = {};
            let anyConditionExpression = '';
            let anyIndex = 0;

            DynamoDBUtilities.dynamodb = {
                query: (params, callback) => {
                    callback(null, anyResults);
                }
            };

            //Technical Debt:  Fix!
            DynamoDBUtilities.countRecords(aTableName, anyParams, anyIndex, (err, data) => {
                // then
                expect(data).to.deep.equal(anyResults.Count);
                done();
            });
        });

        xit('should update records', (done) => {
            // given
            let aTableName = anyTableName;
            let anyParams = {};
            let anyKey = '1';
            let anyExpression = '';

            DynamoDBUtilities.dynamodb = {
                update: (params, callback) => {
                    callback(null, params);
                }
            };

            // when
            DynamoDBUtilities.updateRecord(aTableName, anyKey, anyExpression, anyParams, (err, data) => {
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

        xit('should delete a record', (done) => {
            // given
            let aTableName = anyTableName;
            let anyParams = {};
            let anyKey = '1';
            let anyExpression = '';

            DynamoDBUtilities.dynamodb = {
                delete: (params, callback) => {
                    callback(null, params);
                }
            };

            // when
            DynamoDBUtilities.deleteRecord(aTableName, anyKey, anyExpression, anyParams, (err, data) => {
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

        it('should create disjunction parameters when existing parameters are undefined', () => {
            const result = DynamoDBUtilities.appendDisjunctionQueryParameters(undefined, 'type', ['type1', 'type2']);

            expect(result.expression_attribute_names).to.deep.equal({'#type': 'type'});
            expect(result.expression_attribute_values).to.deep.equal({':typev0': 'type1', ':typev1': 'type2'});
            expect(result.filter_expression).to.equal('(#type = :typev0 OR #type = :typev1)');
        });

        it('should create disjunction parameters when existing parameters are incomplete', () => {
            let query_parameters = {
                filter_expression: 'sample_query AND ',
            };
            const result = DynamoDBUtilities.appendDisjunctionQueryParameters(query_parameters, 'type', ['type1', 'type2']);

            expect(result.expression_attribute_names).to.deep.equal({'#type': 'type'});
            expect(result.expression_attribute_values).to.deep.equal({':typev0': 'type1', ':typev1': 'type2'});
            expect(result.filter_expression).to.equal('sample_query AND (#type = :typev0 OR #type = :typev1)');
        });

        it('should create disjunction parameters when existing parameters are complete', () => {
            let query_parameters = {
                expression_attribute_names: {'#sample': 'sample'},
                expression_attribute_values: {':samplev': 'sample'},
                filter_expression: 'sample_query AND '
            };
            const result = DynamoDBUtilities.appendDisjunctionQueryParameters(query_parameters, 'type', ['type1', 'type2']);

            expect(result.expression_attribute_names).to.deep.equal({'#sample': 'sample','#type': 'type'});
            expect(result.expression_attribute_values).to.deep.equal({':samplev': 'sample', ':typev0': 'type1', ':typev1': 'type2'});
            expect(result.filter_expression).to.equal('sample_query AND (#type = :typev0 OR #type = :typev1)');
        })
    });
});

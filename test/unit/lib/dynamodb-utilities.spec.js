let DynamoDBUtilities = require('../../../lib/dynamodb-utilities');
let chai = require('chai');
let expect = chai.expect;

let anyItem = { property: 'value' };
let anyTableName = 'tableName';
let serverError = '[500] An error occurred.';

const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

describe('lib/dynamodb-utilities', () => {

    describe('saveRecord', () => {

        it('should save a record', () => {
            // given
            let anItem = anyItem;
            let aTableName = anyTableName;
            let anyResults = { TableName: 'tableName', Item: { property: 'value' } };

            DynamoDBUtilities.dynamodb =  {
                put: (params, callback) => {
                    callback(null, params);
                }
            };

            return DynamoDBUtilities.saveRecord(aTableName, anItem).then((result) => {
                expect(result).to.deep.equal(anyResults);
            });
        });

        it('should throw an error if saving fails', () => {
            // given
            let anItem = anyItem;
            let aTableName = anyTableName;

            DynamoDBUtilities.dynamodb = {
                put: (params, callback) => {
                    callback(eu.getError('server','An error occurred.'), 'A stacktrace.');
                }
            };

            return DynamoDBUtilities.saveRecord(aTableName, anItem).catch((error) => {
                expect(error.message).to.equal(serverError);
            });
        });
    });

    describe('retrieveRecord', () => {

        it('should retrieve a record', () => {
            // given
            let anyKey = '1';
            let aTableName = anyTableName;
            let anyResults = { TableName: 'tableName', Key: '1' };

            DynamoDBUtilities.dynamodb =  {
                get: (params, callback) => {
                    callback(null, params);
                }
            };

            return DynamoDBUtilities.get(aTableName, anyKey).then((result) => {
                expect(result).to.deep.equal(anyResults);
            });
        });
    });

    describe('scanRecord', () => {

        it('should scan records', () => {
            // given
            let aTableName = anyTableName;
            let anyResults = { Items: [{ a: 'b' }, { c: 'd' }]};
            let anyParams = {};

            DynamoDBUtilities.dynamodb = {
                scan: (params, callback) => {
                    callback(null, anyResults);
                }
            };

            return DynamoDBUtilities.scanRecords(aTableName, anyParams).then((result) => {
                expect(result).to.deep.equal(anyResults);
            });
        });

        it('should return empty results when no records', () => {
            // given
            let aTableName = anyTableName;
            let anyResults = { Items: [] };
            let anyParams = {};

            DynamoDBUtilities.dynamodb = {
                scan: (params, callback) => {
                    callback(null, anyResults);
                }
            };

            return DynamoDBUtilities.scanRecords(aTableName, anyParams).then((result) => {
                expect(result).to.deep.equal(anyResults);
            });
        });

        it('should retain limits when scanning records', () => {
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

            return DynamoDBUtilities.scanRecords(aTableName, paramsWithLimit).then((result) => {
                expect(result).to.deep.equal(anyResults);
            });
        });

        it('should throw an error if scanning fails', () => {
            // given
            let anItem = anyItem;
            let aTableName = anyTableName;

            DynamoDBUtilities.dynamodb = {
                scan: (params, callback) => {
                    callback(eu.getError('server','An error occurred.'), 'A stacktrace.');
                }
            };

            return DynamoDBUtilities.scanRecords(aTableName, anItem).catch((error) => {
                expect(error.message).to.equal(serverError);
            });
        });
    });

    describe('queryRecord', () => {

        it('should query records', () => {
            // given
            let aTableName = anyTableName;
            let anyResults = { Items: [{ a: 'b' }, { c: 'd' }]};
            let anyParams = {};
            let anyIndex = 0;

            DynamoDBUtilities.dynamodb = {
                query: (params, callback) => {
                    callback(null, anyResults);
                }
            };

            return DynamoDBUtilities.queryRecords(aTableName, anyParams, anyIndex).then((result) => {
                expect(result).to.deep.equal(anyResults);
            });
        });
    });

    describe('countRecord', () => {

        it('should count records', () => {
            // given
            let aTableName = anyTableName;
            let anyResults = { Count: 2};
            let anyParams = {};
            let anyIndex = 0;

            DynamoDBUtilities.dynamodb = {
                query: (params, callback) => {
                    callback(null, anyResults);
                }
            };

            return DynamoDBUtilities.countRecords(aTableName, anyParams, anyIndex).then((result) => {
                expect(result).to.deep.equal(anyResults);
            });
        });
        });

    describe('updateRecord', () => {

        it('should update records', () => {
            // given
            let aTableName = anyTableName;
            let anyParams = {};
            let anyKey = '1';
            let anyExpression = '';
            let anyResult = {
                TableName: 'tableName',
                Key: '1',
                UpdateExpression: '',
                ExpressionAttributeValues: {},
                ReturnValues: 'UPDATED_NEW' //default value
            };

            DynamoDBUtilities.dynamodb = {
                update: (params, callback) => {
                    callback(null, params);
                }
            };

            return DynamoDBUtilities.updateRecord(aTableName, anyKey, anyExpression, anyParams).then((result) => {
                expect(result).to.deep.equal(anyResult);
            });
        });
    });

    describe('deleteRecord', () => {
        it('should delete a record', () => {
            // given
            let aTableName = anyTableName;
            let anyParams = {};
            let anyKey = '1';
            let anyExpression = '';
            let anyResults = {
                TableName: 'tableName',
                Key: '1',
                ConditionExpression: '',
                ExpressionAttributeValues: {}
            };

            DynamoDBUtilities.dynamodb = {
                delete: (params, callback) => {
                    callback(null, params);
                }
            };

            return DynamoDBUtilities.deleteRecord(aTableName, anyKey, anyExpression, anyParams).then((result) => {
                expect(result).to.deep.equal(anyResults);
            });
        });
    });

    describe('createTable', () => {

        it('should create a table', () => {
            // given
            let anyParams = {};
            let anyResults = 'success';

            DynamoDBUtilities.dynamoraw =  {
                createTable: (params, callback) => {
                    callback(null, anyResults);
                }
            };

            return DynamoDBUtilities.createTable(anyParams).then((result) => {
                expect(result).to.equal(anyResults);
            });
        });
    });

    describe('updateTable', () => {

        it('should update a table', () => {
            // given
            let anyParams = {};
            let anyResults = 'success';

            DynamoDBUtilities.dynamoraw =  {
                updateTable: (params, callback) => {
                    callback(null, anyResults);
                }
            };

            return DynamoDBUtilities.updateTable(anyParams).then((result) => {
                expect(result).to.equal(anyResults);
            });
        });
    });

    describe('describeTable', () => {

        it('should describe a table', () => {
            // given
            let aTableName = anyTableName;
            let anyResults = { TableName: 'tableName' };

            DynamoDBUtilities.dynamoraw =  {
                describeTable: (params, callback) => {
                    callback(null, params);
                }
            };

            return DynamoDBUtilities.describeTable(aTableName).then((result) => {
                expect(result).to.deep.equal(anyResults);
            });
        });
    });

    describe('deleteTable', () => {

        it('should delete a table', () => {
            // given
            let aTableName = anyTableName;
            let anyResults = { TableName: 'tableName' };

            DynamoDBUtilities.dynamoraw =  {
                deleteTable: (params, callback) => {
                    callback(null, params);
                }
            };

            return DynamoDBUtilities.deleteTable(aTableName).then((result) => {
                expect(result).to.deep.equal(anyResults);
            });
        });

        it('throws error when table is not removed', () => {
            // given
            let aTableName = anyTableName;

            DynamoDBUtilities.dynamoraw =  {
                deleteTable: (params, callback) => {
                    callback(new Error('fail'), null);
                }
            };

            return DynamoDBUtilities.deleteTable(aTableName).catch((error) => {
                expect(error.message).to.deep.equal('[500] fail');
            });
        });
        });

    describe('waitFor', () => {

        it('should wait', () => {
            // given
            let aTableName = anyTableName;
            let anyResults = { TableName: 'tableName' };
            let anyStatus = 'anyStatus';

            DynamoDBUtilities.dynamoraw =  {
                waitFor: (status, params, callback) => {
                    callback(null, params);
                }
            };

            return DynamoDBUtilities.waitFor(aTableName, anyStatus).then((result) => {
                expect(result).to.deep.equal(anyResults);
            });
        });

        it('throws error from dynamoraw waitFor', () => {
            // given
            let aTableName = anyTableName;
            let anyStatus = 'anyStatus';

            DynamoDBUtilities.dynamoraw =  {
                waitFor: (status, params, callback) => {
                    callback(new Error('fail'), null);
                }
            };

            return DynamoDBUtilities.waitFor(aTableName, anyStatus).catch((error) => {
                expect(error.message).to.equal('[500] fail');
            });
        });
    });

    describe('createINQueryParameters', () => {

        it('throws error when array entry is not a string', () => {
            // given
            let anyFieldName = 'aFieldName';
            let anyArray = [1]; //array with a value that is not a string

            try {
                DynamoDBUtilities.createINQueryParameters(anyFieldName, anyArray)
            }catch(error) {
                expect(error.message).to.equal('[500] All entries in the "in_array" must be of type string.');
            }
        });

        it('should create object with filter expression and attribute values', () => {
            // given
            let anyFieldName = 'aFieldName';
            let anyArray = ['a', 'b'];

            let inqueryParams = DynamoDBUtilities.createINQueryParameters(anyFieldName, anyArray);

            expect(inqueryParams).to.have.property('filter_expression');
            expect(inqueryParams).to.have.property('expression_attribute_values');
        });
    });

    describe('appendDisjunctionQueryParameters', () => {
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

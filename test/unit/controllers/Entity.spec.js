const mockery = require('mockery');
let chai = require('chai');
let expect = chai.expect;
let EntityController = require('../../../controllers/Entity');
let PermissionTestGenerators = require('../../unit/lib/permission-test-generators');

describe('controllers/Entity.js', () => {
    let entityController;

    before(() => {
        mockery.enable({
            useCleanCache: true,
            warnOnReplace: false,
            warnOnUnregistered: false
        });
    });

    afterEach(() => {
        mockery.resetCache();
    });

    after(() => {
        mockery.deregisterAll();
    });

    describe('can', () => {
        before(() => {
            entityController = new EntityController('table_name', 'entity');
        });

        it('fails when user is not defined', () => {
            // given
            let anAction = 'create';
            global.user = null;

            // when
            return entityController.can(anAction).catch((error) => {
                // then
                expect(error.message).to.equal('Missing request parameters');
            });
        });
    });

    describe('create', () => {
        before(() => {
            entityController = new EntityController('table_name', 'entity');
        });

        it('fails when user is not defined', () => {
            // when
            return entityController.create({}).catch((error) => {
                // then
                expect(error.message).to.equal('Missing request parameters');
            });
        });

        it('returns entity when saving succeeds', () => {
            // given
            let anEntity = {
                id: 1
            };

            PermissionTestGenerators.givenUserWithAllowed('create', 'entity');

            mockery.registerMock('../lib/dynamodb-utilities.js', {
                queryRecords: (table, parameters, index, callback) => {
                    callback(null, []);
                },
                saveRecord: (tableName, entity, callback) => {
                    callback(null, entity);
                }
            });

            mockery.registerMock('../lib/indexing-utilities.js', {
                addToSearchIndex: (entity) => {
                    return new Promise((resolve) => resolve(true));
                }
            });

            const EC = require('../../../controllers/Entity');
            let entityController = new EC('table_name', 'entity');

            // when
            return entityController.create(anEntity).then((result) => {
                // then
                expect(result).to.equal(anEntity);
            });
        });

        it('fails entity with given id already exists', () => {
            // given
            let anEntity = {
                id: 1
            };

            PermissionTestGenerators.givenUserWithAllowed('create', 'entity');

            mockery.registerMock('../lib/dynamodb-utilities.js', {
                queryRecords: (table, parameters, index, callback) => {
                    callback(null, [anEntity]);
                },
                saveRecord: (tableName, entity, callback) => {
                    callback(null, entity);
                }
            });

            mockery.registerMock('../lib/indexing-utilities.js', {
                addToSearchIndex: (entity) => {
                    return new Promise((resolve) => resolve(true));
                }
            });

            const EC = require('../../../controllers/Entity');
            let entityController = new EC('table_name', 'entity');

            // when
            return entityController.create(anEntity).catch((error) => {
                // then
                expect(error.message).to.equal(`A entity already exists with ID: "${anEntity.id}"`);
            });
        });

        it('throws error when reading from database fails', () => {
            // given
            let anEntity = {
                id: 1
            };

            PermissionTestGenerators.givenUserWithAllowed('create', 'entity');

            mockery.registerMock('../lib/dynamodb-utilities.js', {
                queryRecords: (table, parameters, index, callback) => {
                    callback(new Error('Reading failed.'), null);
                }
            });

            const EC = require('../../../controllers/Entity');
            let entityController = new EC('table_name', 'entity');

            // when
            return entityController.create(anEntity).catch((error) => {
                // then
                expect(error.message).to.equal('Reading failed.');
            });
        });
    });

    describe('update', () => {
        before(() => {
            entityController = new EntityController('table_name', 'entity');
        });

        it('fails when user is not defined', () => {
            // when
            return entityController.update({}).catch((error) => {
                // then
                expect(error.message).to.equal('Missing request parameters');
            });
        });

        it('throws error when reading from database fails', () => {
            // given
            let anEntity = {
                id: 1
            };

            PermissionTestGenerators.givenUserWithAllowed('update', 'entity');

            mockery.registerMock('../lib/dynamodb-utilities.js', {
                queryRecords: (table, parameters, index, callback) => {
                    callback(new Error('Reading failed.'), null);
                }
            });

            const EC = require('../../../controllers/Entity');
            let entityController = new EC('table_name', 'entity');

            // when
            return entityController.update(anEntity).catch((error) => {
                // then
                expect(error.message).to.equal('Reading failed.');
            });
        });
    });

    describe('delete', () => {
        afterEach(() => {
            mockery.resetCache();
        });

        after(() => {
            mockery.deregisterAll();
        });

        it('fails when user is not defined', () => {
            // given
            let entityController = new EntityController('table_name', 'entity');
            global.user = null;

            // when
            return entityController.delete({}).catch((error) => {
                // then
                expect(error.message).to.equal('Missing request parameters');
            });
        });

        it('throws error when reading from database fails', () => {
            // given
            let anEntity = {
                id: 1
            };

            PermissionTestGenerators.givenUserWithAllowed('delete', 'entity');

            mockery.registerMock('../lib/dynamodb-utilities.js', {
                queryRecords: (table, parameters, index, callback) => {
                    callback(new Error('Reading failed.'), null);
                }
            });

            const EC = require('../../../controllers/Entity');
            let entityController = new EC('table_name', 'entity');

            // when
            return entityController.delete(anEntity.id).catch((error) => {
                // then
                expect(error.message).to.equal('Reading failed.');
            });
        });
    });

    describe('get', () => {
        afterEach(() => {
            mockery.resetCache();
        });

        after(() => {
            mockery.deregisterAll();
        });

        it('fails when user is not defined', () => {
            // given
            global.user = null;
            let entityController = new EntityController('table_name', 'entity');

            // when
            return entityController.get(1).catch((error) => {
                // then
                expect(error.message).to.equal('Missing request parameters');
            });
        });

        it('gets the entity from database when has permissions and entity exists', () => {
            // given
            let anEntity = {
                id: 1
            };

            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock('../lib/dynamodb-utilities.js', {
                queryRecords: (table, parameters, index, callback) => {
                    callback(null, [anEntity]);
                }
            });

            const EC = require('../../../controllers/Entity');
            let entityController = new EC('table_name', 'entity');

            // when
            return entityController.get(anEntity.id).then((response) => {
                // then
                expect(response).to.equal(anEntity);
            });
        });

        it('throws error when reading from database fails', () => {
            // given
            let anEntity = {
                id: 1
            };

            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock('../lib/dynamodb-utilities.js', {
                queryRecords: (table, parameters, index, callback) => {
                    callback(new Error('Reading failed.'), null);
                }
            });

            const EC = require('../../../controllers/Entity');
            let entityController = new EC('table_name', 'entity');

            // when
            return entityController.get(anEntity.id).catch((error) => {
                // then
                expect(error.message).to.equal('Reading failed.');
            });
        });

        it('throws error when reading from database returns more than 1 result', () => {
            // given
            let anEntity = {
                id: 1
            };

            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock('../lib/dynamodb-utilities.js', {
                queryRecords: (table, parameters, index, callback) => {
                    callback(null, [anEntity, anEntity]);
                }
            });

            const EC = require('../../../controllers/Entity');
            let entityController = new EC('table_name', 'entity');

            // when
            return entityController.get(anEntity.id).catch((error) => {
                // then
                expect(error.message).to.equal('Multiple entitys returned where one should be returned.');
            });
        });

        it('returns null when there are no results', () => {
            // given
            let anEntity = {
                id: 1
            };

            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock('../lib/dynamodb-utilities.js', {
                queryRecords: (table, parameters, index, callback) => {
                    callback(null, []);
                }
            });

            const EC = require('../../../controllers/Entity');
            let entityController = new EC('table_name', 'entity');

            // when
            return entityController.get(anEntity.id).then((result) => {
                // then
                expect(result).to.equal(null);
            });
        });

        it('throws error when has no permissions', () => {
            // given
            let anEntity = {
                id: 1
            };

            PermissionTestGenerators.givenUserWithDenied('read', 'entity');

            const EC = require('../../../controllers/Entity');
            let entityController = new EC('table_name', 'entity');

            // when
            return entityController.get(anEntity.id).then((response) => {
                // then
                expect(response).to.equal(null);
            });
        });
    });

    describe('list', () => {
        afterEach(() => {
            mockery.resetCache();
        });

        after(() => {
            mockery.deregisterAll();
        });

        it('can\'t list without permissions', () => {
            // given
            PermissionTestGenerators.givenUserWithDenied('read', 'entity');

            const EC = require('../../../controllers/Entity');
            let entityController = new EC('table_name', 'entity');

            // when
            return entityController.list(0, 10).then((response) => {
                // then
                expect(response).to.equal(null);
            });
        });

        it('throws an error when data has no Items', () => {
            // given
            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock('../lib/dynamodb-utilities.js', {
                scanRecordsFull: (table, parameters, callback) => {
                    callback(null, {
                        LastEvaluatedKey: {
                            id: 1
                        }
                    });
                }
            });

            const EC = require('../../../controllers/Entity');
            let entityController = new EC('table_name', 'entity');

            // when
            return entityController.list(0, 10).catch((error) => {
                // then
                expect(error.message).to.equal('Data has no items.');
            });
        });

        it('throws an error when data is not an object', () => {
            // given
            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock('../lib/dynamodb-utilities.js', {
                scanRecordsFull: (table, parameters, callback) => {
                    callback(null, 'result');
                }
            });

            const EC = require('../../../controllers/Entity');
            let entityController = new EC('table_name', 'entity');

            // when
            return entityController.list(0, 10).catch((error) => {
                // then
                expect(error.message).to.equal('Data is not an object.');
            });
        });

        it('throws an error when scanning data fails', () => {
            // given
            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock('../lib/dynamodb-utilities.js', {
                scanRecordsFull: (table, parameters, callback) => {
                    callback(new Error('Scanning failed.'), null);
                }
            });

            const EC = require('../../../controllers/Entity');
            let entityController = new EC('table_name', 'entity');

            // when
            return entityController.list(0, 10).catch((error) => {
                // then
                expect(error.message).to.equal('Scanning failed.');
            });
        });

        it('returns empty data when there are none', () => {
            // given
            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock('../lib/dynamodb-utilities.js', {
                scanRecordsFull: (table, parameters, callback) => {
                    callback(null, {
                        Count: 0,
                        Items: []
                    });
                }
            });

            const EC = require('../../../controllers/Entity');
            let entityController = new EC('table_name', 'entity');

            // when
            return entityController.list(0, 10).then((response) => {
                // then
                expect(response).to.deep.equal({
                    pagination: {
                        count: 0,
                        end_cursor: '',
                        has_next_page: 'false'
                    },
                    entitys: null
                });
            });
        });

        it('returns data when there is any', () => {
            // given
            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock('../lib/dynamodb-utilities.js', {
                scanRecordsFull: (table, parameters, callback) => {
                    callback(null, {
                        Count: 10,
                        Items: [{},{},{},{},{},{},{},{},{},{}]
                    });
                }
            });

            const EC = require('../../../controllers/Entity');
            let entityController = new EC('table_name', 'entity');

            // when
            return entityController.list(0, 10).then((response) => {
                // then
                expect(response).to.deep.equal({
                    pagination: {
                        count: 10,
                        end_cursor: '',
                        has_next_page: 'false'
                    },
                    entitys: [{},{},{},{},{},{},{},{},{},{}]
                });
            });
        });

        it('correctly sets end_cursor', () => {
            // given
            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock('../lib/dynamodb-utilities.js', {
                scanRecordsFull: (table, parameters, callback) => {
                    callback(null, {
                        LastEvaluatedKey: {
                            id: 9
                        },
                        Count: 10,
                        Items: [{},{},{},{},{},{},{},{},{},{}]
                    });
                }
            });

            const EC = require('../../../controllers/Entity');
            let entityController = new EC('table_name', 'entity');

            // when
            return entityController.list(0, 10).then((response) => {
                // then
                expect(response).to.deep.equal({
                    pagination: {
                        count: 10,
                        end_cursor: 9,
                        has_next_page: 'true'
                    },
                    entitys: [{},{},{},{},{},{},{},{},{},{}]
                });
            });
        });

    });

    describe('listBySecondaryIndex', () => {
        afterEach(() => {
            mockery.resetCache();
        });

        after(() => {
            mockery.deregisterAll();
        });

        it('can\'t list without permissions', () => {
            // given
            PermissionTestGenerators.givenUserWithDenied('read', 'entity');

            const EC = require('../../../controllers/Entity');
            let entityController = new EC('table_name', 'entity');

            // when
            return entityController.listBySecondaryIndex('field', 'index_value', 'index_name', 0, 10).then((response) => {
                // then
                expect(response).to.equal(null);
            });
        });

        it('returns null when result is not an array', () => {
            // given
            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock('../lib/dynamodb-utilities.js', {
                queryRecords: (table, parameters, index, callback) => {
                    callback(null, 'result');
                }
            });

            const EC = require('../../../controllers/Entity');
            let entityController = new EC('table_name', 'entity');

            // when
            return entityController.listBySecondaryIndex('field', 'index_value', 'index_name', 0, 10).then((result) => {
                // then
                expect(result).to.equal(null);
            });
        });

        it('throws an error when querying data fails', () => {
            // given
            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock('../lib/dynamodb-utilities.js', {
                queryRecords: (table, parameters, index, callback) => {
                    callback(new Error('Query failed.'), null);
                }
            });

            const EC = require('../../../controllers/Entity');
            let entityController = new EC('table_name', 'entity');

            // when
            return entityController.listBySecondaryIndex('field', 'index_value', 'index_name', 0, 10).catch((error) => {
                // then
                expect(error.message).to.equal('Query failed.');
            });
        });

        it('returns null when there are no results', () => {
            // given
            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock('../lib/dynamodb-utilities.js', {
                queryRecords: (table, parameters, index, callback) => {
                    callback(null, []);
                }
            });

            const EC = require('../../../controllers/Entity');
            let entityController = new EC('table_name', 'entity');

            // when
            return entityController.listBySecondaryIndex('field', 'index_value', 'index_name', 0, 10).then((response) => {
                // then
                expect(response).to.equal(null);
            });
        });

        it('returns data when there is any', () => {
            // given
            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock('../lib/dynamodb-utilities.js', {
                queryRecords: (table, parameters, index, callback) => {
                    callback(null, [{},{}]);
                }
            });

            const EC = require('../../../controllers/Entity');
            let entityController = new EC('table_name', 'entity');

            // when
            return entityController.listBySecondaryIndex('field', 'index_value', 'index_name', 0, 10).then((response) => {
                // then
                expect(response).to.deep.equal([{}, {}]);
            });
        });

    });

    describe('isEmail', () => {
        let entityController;

        before(() => {
            entityController = new EntityController('table_name', 'entity');
        });

        it('should allow valid mail', () => {
            let validEmails = [];

            validEmails.push('test@example.com');
            validEmails.push('test@example.co.uk');

            for (let email of validEmails) {
                expect(entityController.isEmail(email)).to.equal(true, `'${email}' should be considered a valid email but is not.`)
            }
        });

        it('should disallow invalid mail', () => {
            let invalidEmails = [];

            invalidEmails.push('test@');
            invalidEmails.push('example.co.uk');
            invalidEmails.push('@');
            invalidEmails.push('a@b');
            invalidEmails.push('test.@example.com');
            invalidEmails.push('test@.example.com');
            invalidEmails.push(null);
            invalidEmails.push();
            invalidEmails.push({});
            invalidEmails.push(['email@example.com']);

            for (let email of invalidEmails) {
                expect(entityController.isEmail(email)).to.equal(false, `'${email}' should not be considered valid.`)
            }
        });
    });
});

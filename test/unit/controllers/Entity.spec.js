'use strict'

const mockery = require('mockery');
let chai = require('chai');
let expect = chai.expect;
let EntityController = global.SixCRM.routes.include('controllers','entities/Entity');
let PermissionTestGenerators = require('../../unit/lib/permission-test-generators');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');


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
        global.SixCRM.localcache.clear('all');
    });

    after(() => {
        mockery.deregisterAll();
    });

    describe('can', () => {

        before(() => {
            entityController = new EntityController('entity');
        });

        afterEach(() => {
            delete global.user;
        });

        it('fails when user is not defined', () => {
            // given
            let anAction = 'create';

            try{

              entityController.can(anAction);

            }catch(error){

              expect(error.message).to.equal('[500] Global is missing the user property.');

            }


        });

        it('fails when user is denied for action', () => {

            let anAction = 'create';
            let anEntity = 'entity';

            PermissionTestGenerators.givenUserWithDenied(anAction, anEntity);

            try {

              entityController.can(anAction);

            }catch(error){

              expect(error.message).to.equal('[500] Unexpected ACL object structure:  Empty role.permission.allow object.');

            }

        });

        it('fails when user is not allowed for action', () => {

          let anAction = 'create';
          let anEntity = 'entity';

          PermissionTestGenerators.givenUserWithNoPermissions();

          try {
            entityController.can(anAction);
          }catch(error){
            expect(error.message).to.equal('[500] Unexpected ACL object structure:  Empty role.permission.allow object.');
          }

        });

        it('succeeds when user is allowed for action', () => {
            // given
            let anAction = 'create';
            let anEntity = 'entity';

            PermissionTestGenerators.givenUserWithAllowed(anAction, anEntity);
            // when
            return entityController.can(anAction).then((can) => {
                // then
                expect(can).to.equal(true);
            });
        });

    });

    describe('create', () => {

        before(() => {
            entityController = new EntityController('entity');
        });

        afterEach(() => {
            delete global.user;
        });

        it('fails when user is not defined', () => {

            try{
              entityController.create({entity: {}})
            }catch(error){
              expect(error.message).to.equal('[500] Global is missing the user property.');
            }

        });

        it('returns entity when saving succeeds', () => {
            // given
            let anEntity = {
                secret_key:"secret-key",
                access_key:"access-key"
            };

            PermissionTestGenerators.givenUserWithAllowed('create', 'accesskey');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index, callback) => {
                    callback(null, []);
                },
                saveRecord: (tableName, entity, callback) => {
                    callback(null, entity);
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('lib', 'indexing-utilities.js'), {
                addToSearchIndex: (entity) => {
                    return new Promise((resolve) => resolve(true));
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('helpers', 'redshift/Activity.js'), {
                createActivity: () => {
                    return Promise.resolve();
                }
            });

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
            let entityController = new EC('accesskey');

            // when
            return entityController.create({entity: anEntity}).then((result) => {
                // then
                expect(result.secret_key).to.equal(anEntity.secret_key);
                expect(result.access_key).to.equal(anEntity.access_key);
                expect(result).to.have.property('id');
                expect(result).to.have.property('created_at');
                expect(result).to.have.property('updated_at');

            });
        });

        it('fails entity with given id already exists', () => {
            // given
            let anEntity = {
                id:"82478014-c96f-49ef-b31c-5408e99df66e",
                secret_key:"secret-key",
                access_key:"access-key"
            };

            PermissionTestGenerators.givenUserWithAllowed('create', 'accesskey');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index, callback) => {
                    callback(null, [anEntity]);
                },
                saveRecord: (tableName, entity, callback) => {
                    callback(null, entity);
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('lib', 'indexing-utilities.js'), {
                addToSearchIndex: (entity) => {
                    return new Promise((resolve) => resolve(true));
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('lib', 'kinesis-firehose-utilities.js'), {
                putRecord: (entity) => {
                    return new Promise((resolve) => resolve(entity));
                }
            });

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js')
            let entityController = new EC('accesskey');

            // when
            return entityController.create({entity: anEntity}).catch((error) => {
                // then
                expect(error.message).to.equal(`[400] A accesskey already exists with ID: "${anEntity.id}"`);
            });
        });

        xit('throws error when reading from database fails', () => {
            // given
            let anEntity = {
                secret_key:"secret-key",
                access_key:"access-key"
            };

            PermissionTestGenerators.givenUserWithAllowed('create', 'accesskey');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index, callback) => {
                    callback(eu.getError('server','Reading failed.'), null);
                }
            });

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js')
            let entityController = new EC('accesskey');

            // when
            return entityController.create({entity: anEntity}).catch((error) => {
                // then
                expect(error.message).to.equal('[500] Reading failed.');
            });
        });
    });

    describe('update', () => {

        before(() => {
            entityController = new EntityController('accesskey');
        });

        afterEach(() => {
            delete global.user;
        });

        it('fails when user is not defined', () => {

            try {
              entityController.update({entity: {}})
            }catch(error){
              expect(error.message).to.equal('[500] Global is missing the user property.');
            }

        });

        it('throws error when reading from database fails', () => {
            // given
            let anEntity = {
                id:"82478014-c96f-49ef-b31c-5408e99df66f",
                secret_key:"secret-key",
                access_key:"access-key"
            };

            PermissionTestGenerators.givenUserWithAllowed('update', 'accesskey');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index, callback) => {
                    callback(eu.getError('server','Reading failed.'), null);
                }
            });

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js')
            let entityController = new EC('accesskey');

            // when
            return entityController.update({entity: anEntity}).catch((error) => {
                // then
                expect(error.message).to.equal('[500] Reading failed.');

            });
        });
    });

    describe('delete', () => {
        afterEach(() => {
            delete global.user;
            mockery.resetCache();
        });

        after(() => {
            mockery.deregisterAll();
        });

        it('fails when user is not defined', () => {
            // given
            let entityController = new EntityController('accesskey');

            // when
            try{
              entityController.delete({id:{}})
            }catch(error){
              expect(error.message).to.equal('[500] Global is missing the user property.');
            }

        });

        it('throws error when reading from database fails', () => {
            // given
            let anEntity = {
                id: 'e3db1095-c6dd-4ca7-b9b0-fe38ddad3f8a'
            };

            PermissionTestGenerators.givenUserWithAllowed('delete', 'accesskey');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index, callback) => {
                    callback(eu.getError('server', 'Reading failed.'), null);
                }
            });

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js')
            let entityController = new EC('accesskey');

            // when
            return entityController.delete({id: anEntity.id}).catch((error) => {
                expect(error.message).to.equal('[500] Reading failed.');
            });
        });

        it('throws error when deleting from database fails', () => {
            // given
            let anEntity = {
                id: 'e3db1095-c6dd-4ca7-b9b0-fe38ddad3f8a'
            };

            PermissionTestGenerators.givenUserWithAllowed('delete', 'accesskey');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index, callback) => {
                    callback(null, [anEntity]);
                },
                deleteRecord: (table, key, expression, expression_params, callback) => {
                    callback(eu.getError('server','Deleting failed.'), null);
                }
            });

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js')
            let entityController = new EC('accesskey');

            // when
            return entityController.delete({id: anEntity.id}).catch((error) => {
              expect(error.message).to.equal('[500] Deleting failed.');
            });
        });

        it('throws error when there are no entities with given id', () => {
            // given
            let anEntity = {
                id: 'e3db1095-c6dd-4ca7-b9b0-fe38ddad3f8a'
            };

            PermissionTestGenerators.givenUserWithAllowed('delete', 'accesskey');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index, callback) => {
                    callback(null, []);
                }
            });

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js')
            let entityController = new EC('accesskey');

            // when
            return entityController.delete({id: anEntity.id}).catch((error) => {
                // then
                expect(error.message).to.equal(`[404] Unable to delete accesskey with ID: "${anEntity.id}" -  record doesn't exist or multiples returned.`);

            });
        });

        it('throws error when there are multiple entities with given id', () => {
            // given
            let anEntity = {
                id: 'e3db1095-c6dd-4ca7-b9b0-fe38ddad3f8a'
            };

            PermissionTestGenerators.givenUserWithAllowed('delete', 'accesskey');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index, callback) => {
                    callback(null, [anEntity, anEntity]);
                }
            });

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js')
            let entityController = new EC('accesskey');

            // when
            return entityController.delete({id: anEntity.id}).catch((error) => {
                // then
                expect(error.message).to.equal('[400] Non-unique data present in the database for id: '+anEntity.id);

            });
        });

        it('succeeds when deleting succeeds', () => {
            // given
            let anEntity = {
                id: 'e3db1095-c6dd-4ca7-b9b0-fe38ddad3f8a'
            };

            PermissionTestGenerators.givenUserWithAllowed('delete', 'accesskey');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index, callback) => {
                    callback(null, [anEntity]);
                },
                deleteRecord: (table, key, expression, expression_params, callback) => {
                    callback(null, anEntity);
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('lib', 'indexing-utilities.js'), {
                removeFromSearchIndex: (entity) => {
                    return new Promise((resolve) => resolve(true));
                }
            });

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js')
            let entityController = new EC('accesskey');

            // when
            return entityController.delete({id: anEntity.id}).catch((error) => {
                // then
                expect(error.message).to.equal('[500] Deleting failed.');
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
          let entityController = new EntityController('entity');

          try{
            entityController.get({id: 1});
          }catch(error){
            expect(error.message).to.equal('[500] Global is missing the user property.');
          }

        });

        it('gets the entity from database when has permissions and entity exists', () => {
            // given
            let anEntity = {
                id: 'e3db1095-c6dd-4ca7-b9b0-fe38ddad3f8a'
            };

            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index, callback) => {
                    callback(null, [anEntity]);
                }
            });

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js')
            let entityController = new EC('entity');

            // when
            return entityController.get({id: anEntity.id}).then((response) => {
                // then
                expect(response).to.equal(anEntity);
            });
        });

        xit('throws error when reading from database fails', () => {
            // given
            let anEntity = {
                id: 'e3db1095-c6dd-4ca7-b9b0-fe38ddad3f8a'
            };

            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index, callback) => {
                    callback(eu.getError('server','Reading failed.'), null);
                }
            });

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js')
            let entityController = new EC('entity');

            // when
            return entityController.get({id: anEntity.id}).catch((error) => {
                // then
                expect(error.message).to.equal('[500] Reading failed.');
            });
        });

        it('throws error when reading from database returns more than 1 result', () => {
            // given
            let anEntity = {
                id: 'e3db1095-c6dd-4ca7-b9b0-fe38ddad3f8a'
            };

            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index, callback) => {
                    callback(null, [anEntity, anEntity]);
                }
            });

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
            let entityController = new EC('entity');

            // when
            return entityController.get({id: anEntity.id}).catch((error) => {
                // then
                expect(error.message).to.equal('[400] Multiple entitys returned where one should be returned.');
            });
        });

        it('returns null when there are no results', () => {
            // given
            let anEntity = {
                id: 'e3db1095-c6dd-4ca7-b9b0-fe38ddad3f8a'
            };

            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index, callback) => {
                    callback(null, []);
                }
            });

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
            let entityController = new EC('entity');

            // when
            return entityController.get({id: anEntity.id}).then((result) => {
                // then
                expect(result).to.equal(null);
            });
        });

        it('throws error when has no permissions', () => {
            // given
            let anEntity = {
                id: 'e3db1095-c6dd-4ca7-b9b0-fe38ddad3f8a'
            };

            PermissionTestGenerators.givenUserWithDenied('read', 'entity');

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
            let entityController = new EC('entity');

            // when
            return entityController.get({id: anEntity.id}).then((response) => {
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

        xit('can\'t list without permissions', () => {
            // given
            PermissionTestGenerators.givenUserWithDenied('read', 'entity');

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
            let entityController = new EC('entity');

            try {
              return entityController.list({pagination:{limit: 10}}).then(result => {
                du.warning(result);
                expect(result).to.equal('');
              });
            }catch(error){
              expect(error.message).to.equal('');
            }

        });

        it('throws an error when data has no Items', () => {
            // given
            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                scanRecordsFull: (table, parameters, callback) => {
                    callback(null, {
                        LastEvaluatedKey: {
                            id: 1
                        }
                    });
                }
            });

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
            let entityController = new EC('entity');

            return entityController.list({pagination:{limit: 10}}).catch((error) => {
                // then
                expect(error.message).to.equal('[404] Data has no items.');
            });
        });

        it('throws an error when data is not an object', () => {
            // given
            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                scanRecordsFull: (table, parameters, callback) => {
                    callback(null, 'result');
                }
            });

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
            let entityController = new EC('entity');

            // when
            return entityController.list({pagination:{limit: 10}}).catch((error) => {

                expect(error.message).to.equal('[404] Data is not an object.');
            });
        });

        it('throws an error when scanning data fails', () => {
            // given
            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                scanRecordsFull: (table, parameters, callback) => {
                    callback(eu.getError('server','Scanning failed.'), null);
                }
            });

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
            let entityController = new EC('entity');

            // when
            return entityController.list({pagination:{limit: 10}}).catch((error) => {
                // then
                expect(error.message).to.equal('[500] Scanning failed.');
            });
        });

        it('returns empty data when there are none', () => {
            // given
            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                scanRecordsFull: (table, parameters, callback) => {
                    callback(null, {
                        Count: 0,
                        Items: []
                    });
                }
            });

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
            let entityController = new EC('entity');

            // when
            return entityController.list({pagination:{limit: 10}}).then((response) => {
                // then
                expect(response).to.deep.equal({
                    pagination: {
                        count: 0,
                        end_cursor: '',
                        has_next_page: 'false',
                        last_evaluated: ""
                    },
                    entitys: null
                });
            });
        });

        it('returns data when there is any', () => {
            // given
            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                scanRecordsFull: (table, parameters, callback) => {
                    callback(null, {
                        Count: 10,
                        Items: [{},{},{},{},{},{},{},{},{},{}]
                    });
                }
            });

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
            let entityController = new EC('entity');

            // when
            return entityController.list({pagination:{limit:10}}).then((response) => {
                // then
                expect(response).to.deep.equal({
                    pagination: {
                        count: 10,
                        end_cursor: '',
                        has_next_page: 'false',
                        last_evaluated: ""
                    },
                    entitys: [{},{},{},{},{},{},{},{},{},{}]
                });
            });
        });

    });

    describe('queryBySecondaryIndex', () => {
        afterEach(() => {
            mockery.resetCache();
        });

        after(() => {
            mockery.deregisterAll();
        });

        xit('can\'t list without permissions', () => {
            // given
            PermissionTestGenerators.givenUserWithDenied('read', 'entity');

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
            let entityController = new EC('entity');

            // when
            return entityController.queryBySecondaryIndex('field', 'index_value', 'index_name', 0, 10).then((response) => {
                // then
                expect(response).to.equal(null);
            });
        });

        it('returns null when result is not an array', () => {
            // given
            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecordsFull: (table, parameters, index, callback) => {
                    callback(null, { Items: 'non array' });
                }
            });

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
            let entityController = new EC('entity');

            // when
            return entityController.queryBySecondaryIndex('field', 'index_value', 'index_name', 0, 10).catch((error) => {
                // then
                expect(error.message).to.equal('[404] Data has no items.');
            });
        });

        it('throws an error when querying data fails', () => {
            // given
            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecordsFull: (table, parameters, index, callback) => {
                    callback(eu.getError('server','Query failed.'), null);
                }
            });

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
            let entityController = new EC('entity');

            // when
            return entityController.queryBySecondaryIndex('field', 'index_value', 'index_name', 0, 10).catch((error) => {
                // then
                expect(error.message).to.equal('[500] Query failed.');
            });
        });

        it('returns null when there are no results', () => {
            // given
            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecordsFull: (table, parameters, index, callback) => {
                    callback(null, { Items: [] });
                }
            });

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
            let entityController = new EC('entity');

            // when
            return entityController.queryBySecondaryIndex('field', 'index_value', 'index_name', 0, 10).then((response) => {
                // then
                expect(response.entitys).to.equal(null);
            });
        });

        it('returns data when there is any', () => {
            // given
            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecordsFull: (table, parameters, index, callback) => {
                    callback(null, { Items: [{},{}] });
                }
            });

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
            let entityController = new EC('entity');

            // when
            return entityController.queryBySecondaryIndex('field', 'index_value', 'index_name', 0, 10).then((response) => {
                // then
                expect(response.entitys).to.deep.equal([{}, {}]);
            });
        });

    });

    describe('isEmail', () => {

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

    describe('isUUID', () => {
        let entityController;

        before(() => {
            entityController = new EntityController('entity');
        });

        it('should allow valid UUID', () => {
            let validUUIDs = [
              /*
              //we don't support v1
              {
                uuid:'dbf6cbca-12fa-11e7-93ae-92361f002671',
                version: 1
              },
              */
              {
                uuid:'2e9b9869-f0f6-4de9-b62e-ce511acd71de',
                version: 4
              }
            ];

            for(let uuid of validUUIDs) {
                console.log(uuid);
                expect(entityController.isUUID(uuid.uuid, uuid.version)).to.equal(true, `'${uuid.uuid}' should be considered a valid UUID but is not.`)
            }
        });

        it('should disallow invalid UUID', () => {
            let invalidUUIDs = [];

            invalidUUIDs.push('abcd');
            invalidUUIDs.push('dbf6cbca-12fa-11e7-93ae-');
            invalidUUIDs.push('-');
            invalidUUIDs.push(null);
            invalidUUIDs.push();
            invalidUUIDs.push({});
            invalidUUIDs.push(['email@example.com']);

            for (let uuid of invalidUUIDs) {
                expect(entityController.isUUID(uuid)).to.equal(false, `'${uuid}' should not be considered valid.`)
            }
        });
    });
});

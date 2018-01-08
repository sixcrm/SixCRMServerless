'use strict'

const mockery = require('mockery');
let chai = require('chai');
let expect = chai.expect;
let EntityController = global.SixCRM.routes.include('controllers','entities/Entity');
let PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators');
const uuidV4 = require('uuid/v4');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const MockEntities = global.SixCRM.routes.include('test','mock-entities.js');

describe('controllers/Entity.js', () => {

    before(() => {
        mockery.enable({
            useCleanCache: true,
            warnOnReplace: false,
            warnOnUnregistered: false
        });
    });

    beforeEach(() => {
      //global.SixCRM.localcache.clear('all');
    });

    afterEach(() => {
        mockery.resetCache();
        mockery.deregisterAll();
    });

    describe('create', () => {

      beforeEach(() => {
        //global.SixCRM.localcache.clear('all');
        delete global.user;
      });

       it('fails when user is not defined', () => {

         const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
         let entityController = new EC('entity');

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
                    return Promise.resolve([]);
                },
                saveRecord: (tableName, entity, callback) => {
                    return Promise.resolve(entity);
                }
            });

            let mock_preindexing_helper = class {
              constructor(){

              }
              addToSearchIndex(entity){
                return Promise.resolve(true);
              }
              removeFromSearchIndex(entity){
                return Promise.resolve(true);
              }
            }

            mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), mock_preindexing_helper);

            mockery.registerMock(global.SixCRM.routes.path('helpers', 'redshift/Activity.js'), {
                createActivity: () => {
                    return Promise.resolve();
                }
            });

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
            let entityController = new EC('accesskey');

            // when
            return entityController.create({entity: anEntity}).then((result) => {

              du.info(result);

                expect(result.secret_key).to.equal(anEntity.secret_key);
                expect(result.access_key).to.equal(anEntity.access_key);
                expect(result).to.have.property('id');
                expect(result).to.have.property('created_at');
                expect(result).to.have.property('updated_at');

            }).catch(error => {

              du.error(error);

            });
        });

        it('fails entity with given id already exists', () => {

            let anEntity = MockEntities.getValidAccessKey('82478014-c96f-49ef-b31c-5408e99df66e');

            PermissionTestGenerators.givenUserWithAllowed('create', 'accesskey');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index) => {
                    return Promise.resolve({Items: [anEntity]});
                },
                saveRecord: (tableName, entity) => {
                    return Promise.resolve(entity);
                }
            });

            let mock_preindexing_helper = class {
              constructor(){

              }
              addToSearchIndex(entity){
                return Promise.resolve(true);
              }
              removeFromSearchIndex(entity){
                return Promise.resolve(true);
              }
            }

            mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), mock_preindexing_helper);

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

        it('throws error when reading from database fails', () => {

            let anEntity = MockEntities.getValidAccessKey();

            PermissionTestGenerators.givenUserWithAllowed('create', 'accesskey');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index) => {
                  eu.throwError('server','Reading failed.');
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

        beforeEach(() => {
          //global.SixCRM.localcache.clear('all');
          delete global.user;
        });

        it('fails when user is not defined', () => {

          const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
          let entityController = new EC('entity');

          try {
            entityController.update({entity: {id: 'dummy-id'}})
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
                queryRecords: (table, parameters, index) => {
                    eu.throwError('server','Reading failed.');
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

        it('fails when primary key is missing', () => {

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
            let entityController = new EC('entity');

            try {
                entityController.update({entity: {}})
            }catch(error){
                expect(error.message).to.equal('[400] Unable to update ' + entityController.descriptive_name
                    + '. Missing property "' + entityController.primary_key + '"');
            }

        });

        it('fail when entity with specified id does not exist', () => {
            // given
            let anEntity = {
                secret_key: "secret-key",
                access_key: "access-key",
                id: 'e3db1095-c6dd-4ca7-b9b0-fe38ddad3f8a'
            };

            PermissionTestGenerators.givenUserWithAllowed('update', 'accesskey');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index) => {
                    return Promise.resolve([]);
                },
                saveRecord: (tableName, entity) => {
                    return Promise.resolve(entity);
                }
            });

            const EC = global.SixCRM.routes.include('controllers', 'entities/Entity.js');
            let entityController = new EC('accesskey');

            // when
            return entityController.update({entity: anEntity}).catch((error) => {
                expect(error.message).to.equal('[404] Unable to update ' + entityController.descriptive_name +
                    ' with ID: "' + anEntity.id + '" -  record doesn\'t exist.');
            });
        });
    });

    describe('delete', () => {

        beforeEach(() => {
          //global.SixCRM.localcache.clear('all');
          delete global.user;
        });

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
                queryRecords: (table, parameters, index) => {
                  eu.throwError('server', 'Reading failed.');
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
                queryRecords: (table, parameters, index) => {
                    return Promise.resolve({Items:[anEntity]});
                },
                deleteRecord: (table, key, expression, expression_params, callback) => {
                    eu.throwError('server','Deleting failed.');
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
                queryRecords: (table, parameters, index) => {
                    return Promise.resolve({Items:[]});
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
                queryRecords: (table, parameters, index) => {
                  return Promise.resolve({Items:[anEntity, anEntity]});
                }
            });

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js')
            let entityController = new EC('accesskey');

            // when
            return entityController.delete({id: anEntity.id}).catch((error) => {
                // then
                expect(error.message).to.equal('[500] Non-specific accesskey entity results.');

            });
        });

        it('succeeds when deleting succeeds', () => {
            // given
            let anEntity = {
                id: 'e3db1095-c6dd-4ca7-b9b0-fe38ddad3f8a'
            };

            PermissionTestGenerators.givenUserWithAllowed('delete', 'accesskey');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index) => {
                    return Promise.resolve({Items:[anEntity]});
                },
                deleteRecord: (table, key, expression, expression_params) => {
                    return Promise.resolve(anEntity);
                }
            });

            let mock_preindexing_helper = class {
              constructor(){

              }
              addToSearchIndex(entity){
                return Promise.resolve(true);
              }
              removeFromSearchIndex(entity){
                return Promise.resolve(true);
              }
            }

            mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), mock_preindexing_helper);

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
            //global.SixCRM.localcache.clear('all');
            delete global.user;
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
                queryRecords: (table, parameters, index) => {
                  return Promise.resolve({Items: [anEntity]});
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

        it('throws error when reading from database fails', () => {
            // given
            let anEntity = {
                id: 'e3db1095-c6dd-4ca7-b9b0-fe38ddad3f8a'
            };

            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index) => {
                    eu.throwError('server','Reading failed.');
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
                queryRecords: (table, parameters, index) => {
                    return Promise.resolve({Items:[anEntity, anEntity]});
                }
            });

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
            let entityController = new EC('entity');

            // when
            return entityController.get({id: anEntity.id}).catch((error) => {
                // then
                expect(error.message).to.equal('[500] Non-specific entity entity results.');
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
                    return Promise.resolve({Items:[]});
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
            }).catch(error => {
              expect(error.message).to.equal('[500] Invalid Permissions: user can not read on entity');
            })
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

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
            let entityController = new EC('entity');

            return entityController.list({pagination:{limit: 10}})
            .catch(error => {
              expect(error.message).to.equal('[500] Invalid Permissions: user can not read on entity');
            });

        });

        it('throws an error when data has no Items', () => {
            // given
            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                scanRecords: (table, parameters) => {
                    return Promise.resolve({Items: [], LastEvaluatedKey: {id: 1}});
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
                scanRecords: (table, parameters, callback) => {
                  return Promise.resolve('');
                }
            });

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
            let entityController = new EC('entity');

            // when
            return entityController.list({pagination:{limit: 10}}).catch((error) => {

                expect(error.message).to.equal('[500] Thing is not an object.');
            });
        });

        it('throws an error when scanning data fails', () => {
            // given
            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                scanRecords: (table, parameters) => {
                    eu.throwError('server','Scanning failed.');
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
                scanRecords: (table, parameters) => {
                  return Promise.resolve({Count: 0,Items: []});
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
                scanRecords: (table, parameters, callback) => {
                    return Promise.resolve({
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

        it('can\'t list without permissions', () => {
            // given
            PermissionTestGenerators.givenUserWithDenied('read', 'entity');

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
            let entityController = new EC('entity');

            // when
            return entityController.queryBySecondaryIndex('field', 'index_value', 'index_name', 0, 10).then((response) => {
                // then
                expect(response).to.equal(null);
            }).catch(error => {
              expect(error.message).to.equal('[500] Invalid Permissions: user can not read on entity');
            });
        });

        it('returns null when result is not an array', () => {
            // given
            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index) => {
                    return Promise.resolve({ Items: 'non array' });
                }
            });

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
            let entityController = new EC('entity');

            // when
            return entityController.queryBySecondaryIndex('field', 'index_value', 'index_name', 0, 10).catch((error) => {
                // then
                expect(error.message).to.equal('[500] ArrayUtilities.isArray thing argument is not an array.');
            });
        });

        it('throws an error when querying data fails', () => {
            // given
            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index) => {
                    eu.throwError('server','Query failed.');
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
                queryRecords: (table, parameters, index, callback) => {
                    return Promise.resolve({ Items: [] });
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
                queryRecords: (table, parameters, index, callback) => {
                    return Promise.resolve({ Items: [{},{}] });
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

          const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
          let entityController = new EC('entity');

          let validEmails = [];

          validEmails.push('test@example.com');
          validEmails.push('test@example.co.uk');

          for (let email of validEmails) {

            expect(entityController.isEmail(email)).to.equal(true, `'${email}' should be considered a valid email but is not.`)

          }

        });

        it('should disallow invalid mail', () => {

          const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
          let entityController = new EC('entity');

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

    describe('store', () => {

        beforeEach(() => {

            let mock_preindexing_helper = class {
                constructor() {}

                addToSearchIndex(entity) {
                    return Promise.resolve(true);
                }

                removeFromSearchIndex(entity) {
                    return Promise.resolve(true);
                }
            };

            mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), mock_preindexing_helper);

            mockery.registerMock(global.SixCRM.routes.path('helpers', 'redshift/Activity.js'), {
                createActivity: () => {
                    return Promise.resolve();
                }
            });
        });

        it('stores entity if it has a primary key', () => {

            let anEntity = MockEntities.getValidAccessKey('e3db1095-c6dd-4ca7-b9b0-fe38ddad3f8a');

            PermissionTestGenerators.givenUserWithAllowed('create', 'accesskey');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index) => {
                    return Promise.resolve([]);
                },
                saveRecord: (tableName, entity) => {
                    return Promise.resolve(entity);
                }
            });

            const EC = global.SixCRM.routes.include('controllers', 'entities/Entity.js');
            let entityController = new EC('accesskey');

            // when
            return entityController.store({entity: anEntity}).then((result) => {
                expect(result.secret_key).to.equal(anEntity.secret_key);
                expect(result.access_key).to.equal(anEntity.access_key);
                expect(result.id).to.equal(anEntity.id);
                expect(result).to.have.property('id');
                expect(result).to.have.property('created_at');
                expect(result).to.have.property('updated_at');

            });
        });

        it('updates existing entity', () => {

            let anEntity = MockEntities.getValidAccessKey('e3db1095-c6dd-4ca7-b9b0-fe38ddad3f8a');

            PermissionTestGenerators.givenUserWithAllowed('update', 'accesskey');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index) => {
                    return Promise.resolve({Items: [anEntity]});
                },
                saveRecord: (tableName, entity) => {
                    return Promise.resolve(entity);
                }
            });

            const EC = global.SixCRM.routes.include('controllers', 'entities/Entity.js');
            let entityController = new EC('accesskey');

            // when
            return entityController.store({entity: anEntity}).then((result) => {
                expect(result.secret_key).to.equal(anEntity.secret_key);
                expect(result.access_key).to.equal(anEntity.access_key);
                expect(result.id).to.equal(anEntity.id);
                expect(result).to.have.property('id');
                expect(result).to.have.property('created_at');
                expect(result).to.have.property('updated_at');

            });
        });

        it('stores entity when it doesn\'t have a primary key', () => {

            let anEntity = MockEntities.getValidAccessKey('e3db1095-c6dd-4ca7-b9b0-fe38ddad3f8a');

            delete anEntity.id;

            PermissionTestGenerators.givenUserWithAllowed('create', 'accesskey');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index) => {
                    return Promise.resolve([]);
                },
                saveRecord: (tableName, entity) => {
                    return Promise.resolve(entity);
                }
            });

            const EC = global.SixCRM.routes.include('controllers', 'entities/Entity.js');
            let entityController = new EC('accesskey');

            // when
            return entityController.store({entity: anEntity}).then((result) => {
                expect(result.secret_key).to.equal(anEntity.secret_key);
                expect(result.access_key).to.equal(anEntity.access_key);
                expect(result).to.have.property('created_at');
                expect(result).to.have.property('updated_at');

            });
        });
    });

    describe('touch', () => {

        beforeEach(() => {

            let mock_preindexing_helper = class {
                constructor() {}

                addToSearchIndex(entity) {
                    return Promise.resolve(true);
                }

                removeFromSearchIndex(entity) {
                    return Promise.resolve(true);
                }
            };

            mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), mock_preindexing_helper);

            mockery.registerMock(global.SixCRM.routes.path('helpers', 'redshift/Activity.js'), {
                createActivity: () => {
                    return Promise.resolve();
                }
            });
        });

        it('creates entity if it does not exist', () => {

            let anEntity = MockEntities.getValidAccessKey('e3db1095-c6dd-4ca7-b9b0-fe38ddad3f8a');

            PermissionTestGenerators.givenUserWithAllowed('*', 'accesskey');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index) => {
                    return Promise.resolve([]);
                },
                saveRecord: (tableName, entity) => {
                    return Promise.resolve(entity);
                }
            });

            const EC = global.SixCRM.routes.include('controllers', 'entities/Entity.js');
            let entityController = new EC('accesskey');

            // when
            return entityController.touch({entity: anEntity}).then((result) => {
                expect(result.secret_key).to.equal(anEntity.secret_key);
                expect(result.access_key).to.equal(anEntity.access_key);
                expect(result).to.have.property('id');
                expect(result).to.have.property('created_at');
                expect(result).to.have.property('updated_at');

            });
        });

        it('updates entity if it already exists', () => {

            let anEntity = MockEntities.getValidAccessKey('e3db1095-c6dd-4ca7-b9b0-fe38ddad3f8a');

            PermissionTestGenerators.givenUserWithAllowed('update', 'accesskey');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
              queryRecords: (table, parameters, index) => {
                  return Promise.resolve({Items: [anEntity]});
              },
              saveRecord: (tableName, entity) => {
                  return Promise.resolve(entity);
              }
            });

            const EC = global.SixCRM.routes.include('controllers', 'entities/Entity.js');
            let entityController = new EC('accesskey');

            // when
            return entityController.touch({entity: anEntity}).then((result) => {
                expect(result.secret_key).to.equal(anEntity.secret_key);
                expect(result.access_key).to.equal(anEntity.access_key);
                expect(result).to.have.property('id');
                expect(result).to.have.property('created_at');
                expect(result).to.have.property('updated_at');

            });
        });
    });

    describe('createAssociatedEntitiesObject', () => {

        it('fails when object is missing id property', () => {

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
            let entityController = new EC('entity');

            try{
                entityController.createAssociatedEntitiesObject({name: 'a_name', object: {}})
            }catch(error){
                expect(error.message).to.equal('[500] Create Associated Entities expects the object parameter to have field "id"');
            }
        });

        it('creates associated entities object', () => {
            let param = {
                name: 'a_name',
                object: {
                    id: 'dummy_id'
                }
            };

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
            let entityController = new EC('entity');

            expect(entityController.createAssociatedEntitiesObject(param))
                .to.deep.equal({name: param.name, entity: {id: param.object.id}});
        });
    });

    describe('listByUser', () => {

        it('returns data when there is any', () => {

            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index) => {
                    return Promise.resolve({
                        Count: 2,
                        Items: [{}, {}]
                    });
                }
            });

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
            let entityController = new EC('entity');

            return entityController.listByUser({pagination:{limit:2}}).then((response) => {
                expect(response).to.deep.equal({
                    pagination: {
                        count: 2,
                        end_cursor: '',
                        has_next_page: 'false',
                        last_evaluated: ""
                    },
                    entitys: [{},{}]
                });
            });
        });

        it('returns empty data when there are none', () => {

            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index) => {
                    return Promise.resolve({Count: 0,Items: []});
                }
            });

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
            let entityController = new EC('entity');

            return entityController.listByUser({pagination:{limit:2}}).then((response) => {
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
    });

    describe('listByAccount', () => {

        it('returns data when there is any', () => {

            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index) => {
                    return Promise.resolve({
                        Count: 2,
                        Items: [{}, {}]
                    });
                }
            });

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
            let entityController = new EC('entity');

            return entityController.listByAccount({pagination:{limit:2}}).then((response) => {
                expect(response).to.deep.equal({
                    pagination: {
                        count: 2,
                        end_cursor: '',
                        has_next_page: 'false',
                        last_evaluated: ""
                    },
                    entitys: [{},{}]
                });
            });
        });

        it('returns empty data when there are none', () => {

            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index) => {
                    return Promise.resolve({Count: 0,Items: []});
                }
            });

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
            let entityController = new EC('entity');

            return entityController.listByAccount({pagination:{limit:2}}).then((response) => {
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
    });

    describe('getListByAccount', () => {

        it('retrieves list by account', () => {

            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index) => {
                    return Promise.resolve({
                        Count: 2,
                        Items: [{}, {}]
                    });
                },
                createINQueryParameters: (field, list_array) => {
                    return Promise.resolve({
                        filter_expression: 'a_filter',
                        expression_attribute_values: 'an_expression_values'
                    })
                }
            });

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
            let entityController = new EC('entity');

            return entityController.getListByAccount({pagination:{limit:2}}).then((response) => {
                expect(response).to.deep.equal({
                    pagination: {
                        count: 2,
                        end_cursor: '',
                        has_next_page: 'false',
                        last_evaluated: ""
                    },
                    entitys: [{},{}]
                });
            });
        });
    });

    describe('getListByUser', () => {

        it('retrieves list by user', () => {
            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index) => {
                    return Promise.resolve({
                        Count: 2,
                        Items: [{}, {}]
                    });
                },
                createINQueryParameters: (field, list_array) => {
                    return Promise.resolve({
                        filter_expression: 'a_filter',
                        expression_attribute_values: 'an_expression_values'
                    })
                }
            });

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
            let entityController = new EC('entity');

            return entityController.getListByUser({query_parameters: {}, pagination:{limit:2}}).then((response) => {
                expect(response).to.deep.equal({
                    pagination: {
                        count: 2,
                        end_cursor: '',
                        has_next_page: 'false',
                        last_evaluated: ""
                    },
                    entitys: [{},{}]
                });
            });
        });
    });

    describe('getBySecondaryIndex', () => {

        it('successfully retrieves by secondary index', () => {

            let params = {
                field:'field',
                index_value:'index_value',
                index_name:'index_name'
            };

            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index) => {
                    expect(index).to.equal(params.index_name);
                    expect(parameters).to.have.property('key_condition_expression');
                    expect(parameters).to.have.property('filter_expression');
                    expect(parameters).to.have.property('expression_attribute_values');
                    expect(parameters.expression_attribute_values).to.have.property(':index_valuev');
                    expect(parameters.expression_attribute_values).to.have.property(':accountv');
                    return Promise.resolve({ Items: [{a_single_item: 'a_single_item'}] });
                }
            });

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
            let entityController = new EC('entity');

            return entityController.getBySecondaryIndex(params).then((response) => {
                expect(response).to.deep.equal({a_single_item: 'a_single_item'});
            });
        });
    });

    describe('queryByParameters', () => {

        it('returns data retrieved by specified expressions', () => {

            let params = {
                parameters:{
                    filter_expression:'filter_expression',
                    expression_attribute_values:{
                        expression_attribute_value:'expression_attribute_value'
                    },
                    expression_attribute_names:{
                        expression_attribute_name:'expression_attribute_name'
                    }
                },
                pagination:{limit:2},
                index:'an_index'
            };

            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index) => {
                    expect(index).to.equal(params.index);
                    expect(parameters).to.have.property('filter_expression');
                    expect(parameters).to.have.property('expression_attribute_values');
                    expect(parameters).to.have.property('expression_attribute_names');
                    return Promise.resolve({ Count:2, Items: [{}, {}] });
                }
            });

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
            let entityController = new EC('entity');

            return entityController.queryByParameters(params).then((response) => {
                expect(response).to.deep.equal({
                    pagination: {
                        count: 2,
                        end_cursor: '',
                        has_next_page: 'false',
                        last_evaluated: ""
                    },
                    entitys: [{},{}]
                });
            });
        });
    });

    //Note:  Method eliminated
    xdescribe('scanByParameters', () => {

        it('successfully scans by specified expressions', () => {

            let params = {
                parameters:{
                    filter_expression:'filter_expression',
                    expression_attribute_values:{
                        expression_attribute_value:'expression_attribute_value'
                    },
                    expression_attribute_names:{
                        expression_attribute_name:'expression_attribute_name'
                    }
                },
                pagination:{limit:2}
            };

            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                scanRecords: (table, parameters) => {
                    expect(parameters).to.have.property('filter_expression');
                    expect(parameters).to.have.property('expression_attribute_values');
                    expect(parameters).to.have.property('expression_attribute_names');
                    return Promise.resolve({ Count:2, Items: [{}, {}] });
                }
            });

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
            let entityController = new EC('entity');

            return entityController.scanByParameters(params).then((response) => {
                expect(response).to.deep.equal({
                    pagination: {
                        count: 2,
                        end_cursor: '',
                        has_next_page: 'false',
                        last_evaluated: ""
                    },
                    entitys: [{},{}]
                });
            });
        });
    });

    describe('checkAssociatedEntities', () => {

        it('throws error when appointed entity is associated with other entities', () => {

            let entity_name = 'entity';

            let associated_entities = {
                name: 'a_name',
                entity: {
                    type: {},
                    id: uuidV4()
                }
            };

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
            let entityController = new EC(entity_name);

            entityController.associatedEntitiesCheck = () => {
                return Promise.resolve([associated_entities]);
            };

            return entityController.checkAssociatedEntities({id:'dummy_id'}).catch((error) => {
                expect(error.message).to.deep.equal('[403] The ' + entity_name + ' entity that you are attempting to delete ' +
                    'is currently associated with other entities.  Please delete the entity associations before ' +
                    'deleting this ' + entity_name + '.');
            });
        });

        it('returns true when entity is not associated with other entites', () => {

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
            let entityController = new EC('entity');

            entityController.associatedEntitiesCheck = () => {
                return Promise.resolve([]);
            };

            return entityController.checkAssociatedEntities({id:'dummy_id'}).then((result) => {
                expect(result).to.be.true;
            });
        });
    });
});

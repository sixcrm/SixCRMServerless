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

    describe('getShared', () => {
        it('returns the entity if shared', () => {
            let entity = MockEntities.getValidAccessKey('82478014-c96f-49ef-b31c-5408e99df66e');
            let entityAcl = {
                entity: '82478014-c96f-49ef-b31c-5408e99df66e',
                type: 'accesskey',
                allow: ['*'],
                deny: ['*']
            };

            PermissionTestGenerators.givenAnyUser();

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table) => {
                    if (table === 'entityacls') {
                        return Promise.resolve({Items: [entityAcl]});
                    }
                    return Promise.resolve({Items: [entity]});
                },
                saveRecord: (tableName, entity) => {
                    return Promise.resolve(entity);
                }
            });

            let mock_preindexing_helper = class {
              constructor(){

              }
              addToSearchIndex(){
                return Promise.resolve(true);
              }
              removeFromSearchIndex(){
                return Promise.resolve(true);
              }
            }

            mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), mock_preindexing_helper);

            mockery.registerMock(global.SixCRM.routes.path('helpers', 'redshift/Activity.js'), {
                createActivity: () => {
                    return Promise.resolve();
                }
            });

            const EC = global.SixCRM.routes.include('controllers', 'entities/Entity.js');
            let entityController = new EC('entity');

            return entityController.getShared({id:entity.id}).then(result => {
                expect(result).to.deep.equal(entity);
            });
        });

        it('returns throws an error if not shared', () => {
            let entity = MockEntities.getValidAccessKey('82478014-c96f-49ef-b31c-5408e99df66e');
            let entityAcl = {
                entity: '82478014-c96f-49ef-b31c-5408e99df66e',
                type: 'accesskey',
                allow: [],
                deny: ['*']
            };

            PermissionTestGenerators.givenAnyUser();

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table) => {
                    if (table === 'entityacls') {
                        return Promise.resolve({Items: [entityAcl]});
                    }
                    return Promise.resolve({Items: [entity]});
                },
                saveRecord: (tableName, entity) => {
                    return Promise.resolve(entity);
                }
            });

            let mock_preindexing_helper = class {
              constructor(){

              }
              addToSearchIndex(){
                return Promise.resolve(true);
              }
              removeFromSearchIndex(){
                return Promise.resolve(true);
              }
            }

            mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), mock_preindexing_helper);

            mockery.registerMock(global.SixCRM.routes.path('helpers', 'redshift/Activity.js'), {
                createActivity: () => {
                    return Promise.resolve();
                }
            });

            const EC = global.SixCRM.routes.include('controllers', 'entities/Entity.js');
            let entityController = new EC('entity');

            return entityController.getShared({id: entity.id}).catch(error => {
                expect(error.message).to.equal('[403] User is not authorized to perform this action.');
            });
        });
    });

    describe('listShared', () => {
        it('returns a list of shared entities corresponding to type', () => {
            PermissionTestGenerators.givenAnyUser();
            const acls = [{
                entity: 'ead02cb4-61f9-49de-bd08-e9192718e75d',
                type: 'type',
                allow: [],
                deny: []
            }, {
                entity: '2a5f786d-69fb-44ea-ad2f-137bb515543c',
                type: 'type',
                allow: [],
                deny: ['*']
            }];
            const sharedEntities = [{
                id: 'ead02cb4-61f9-49de-bd08-e9192718e75d'
            }];

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: () => Promise.resolve({ Count: acls.length, Items: acls }),
                scanRecords: () => Promise.resolve({ Count: sharedEntities.length, Items: sharedEntities }),
                createINQueryParameters: () => {
                    return {
                        filter_expression: 'a_filter',
                        expression_attribute_values: 'an_expression_values'
                    };
                }
            });

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
            let entityController = new EC('entity');

            return entityController.listShared({pagination: {limit: 10}}).then(result => {
                expect(result).to.deep.equal({
                    pagination: {
                        count: sharedEntities.length,
                        end_cursor: '',
                        has_next_page: 'false',
                        last_evaluated: ""
                    },
                    entities: sharedEntities
                });
            });
        });

        it('paginates the shared entities', () => {
            PermissionTestGenerators.givenAnyUser();
            const params = {
                pagination: {
                    limit: 2
                }
            };
            const acls = [{
                entity: 'ead02cb4-61f9-49de-bd08-e9192718e75d',
                type: 'type',
                allow: [],
                deny: []
            }, {
                entity: 'f683e149-874a-4572-85b0-afa7c1c5b4dd',
                type: 'type',
                allow: [],
                deny: []
            }, {
                entity: '529c35d9-11f9-4a29-a10f-25eee877450f',
                type: 'type',
                allow: [],
                deny: []
            }];
            const paginatedEntities = [{
                id: 'ead02cb4-61f9-49de-bd08-e9192718e75d'
            }, {
                id: 'f683e149-874a-4572-85b0-afa7c1c5b4dd'
            }];

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: () => Promise.resolve({ Count: acls.length, Items: acls }),
                scanRecords: (table, parameters) => {
                    expect(parameters.limit).to.equal(params.pagination.limit);
                    return Promise.resolve({ Count: params.pagination.limit, Items: paginatedEntities })
                },
                createINQueryParameters: () => {
                    return {
                        filter_expression: 'a_filter',
                        expression_attribute_values: 'an_expression_values'
                    };
                }
            });

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
            let entityController = new EC('entity');

            return entityController.listShared(params).then(result => {
                expect(result).to.deep.equal({
                    pagination: {
                        count: params.pagination.limit,
                        end_cursor: '',
                        has_next_page: 'false',
                        last_evaluated: ""
                    },
                    entities: paginatedEntities
                });
            });
        })
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
                queryRecords: () => {
                    return Promise.resolve([]);
                },
                saveRecord: (tableName, entity) => {
                    return Promise.resolve(entity);
                }
            });

            let mock_preindexing_helper = class {
              constructor(){

              }
              addToSearchIndex(){
                return Promise.resolve(true);
              }
              removeFromSearchIndex(){
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
                queryRecords: () => {
                    return Promise.resolve({Items: [anEntity]});
                },
                saveRecord: (tableName, entity) => {
                    return Promise.resolve(entity);
                }
            });

            let mock_preindexing_helper = class {
              constructor(){

              }
              addToSearchIndex(){
                return Promise.resolve(true);
              }
              removeFromSearchIndex(){
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
                expect(error.message).to.equal(`[400] A accesskey already exists with id: "${anEntity.id}"`);
            });
        });

        it('throws error when reading from database fails', () => {

            let anEntity = MockEntities.getValidAccessKey();

            PermissionTestGenerators.givenUserWithAllowed('create', 'accesskey');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: () => {
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
                queryRecords: () => {
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
                queryRecords: () => {
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

        it('master account does not hijack ownership', () => {
            // given
            let anEntity = {
                "id": "668ad918-0d09-4116-a6fe-0e7a9eda36f8",
                "account":"d3fa3bf3-7824-49f4-8261-87674482bf1c",
                "name": "Test Product",
                "description":"This is a test description",
                "sku":"123",
                "ship":true,
                "created_at":"2017-04-06T18:40:41.405Z",
                "updated_at":"2017-04-06T18:40:41.405Z"
            };

            PermissionTestGenerators.givenUserWithAllowed('*', '*', '*');
            global.account = '*';

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: () => {
                    return Promise.resolve({Items: [anEntity]});
                },
                saveRecord: (tableName, entity) => {
                    return Promise.resolve(entity);
                }
						});

						let mock_preindexing_helper = class {
              constructor(){

              }
              addToSearchIndex(){
                return Promise.resolve(true);
              }
              removeFromSearchIndex(){
                return Promise.resolve(true);
              }
            }

            mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), mock_preindexing_helper);

            mockery.registerMock(global.SixCRM.routes.path('helpers', 'redshift/Activity.js'), {
                createActivity: () => {
                    return Promise.resolve();
                }
            });


            const EC = global.SixCRM.routes.include('controllers', 'entities/Entity.js');
            let entityController = new EC('product');

            // when
            return entityController.update({entity: anEntity}).then((updatedEntity) => {
                expect(updatedEntity.account).to.equal('d3fa3bf3-7824-49f4-8261-87674482bf1c');
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
                queryRecords: () => {
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
                queryRecords: () => {
                    return Promise.resolve({Items:[anEntity]});
                },
                deleteRecord: () => {
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
                queryRecords: () => {
                    return Promise.resolve({Items:[]});
                }
            });

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js')
            let entityController = new EC('accesskey');

            // when
            return entityController.delete({id: anEntity.id}).catch((error) => {
                // then
                expect(error.message).to.equal(`[404] Unable to delete accesskey with id: "${anEntity.id}" -  record doesn't exist or multiples returned.`);

            });

        });

        it('throws error when there are multiple entities with given id', () => {
            // given
            let anEntity = {
                id: 'e3db1095-c6dd-4ca7-b9b0-fe38ddad3f8a'
            };

            PermissionTestGenerators.givenUserWithAllowed('delete', 'accesskey');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: () => {
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
                queryRecords: () => {
                    return Promise.resolve({Items:[anEntity]});
                },
                deleteRecord: () => {
                    return Promise.resolve(anEntity);
                }
            });

            let mock_preindexing_helper = class {
              constructor(){

              }
              addToSearchIndex(){
                return Promise.resolve(true);
              }
              removeFromSearchIndex(){
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
                queryRecords: () => {
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
                queryRecords: () => {
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
                queryRecords: () => {
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
                queryRecords: () => {
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
                scanRecords: () => {
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
                scanRecords: () => {
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
                scanRecords: () => {
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
                scanRecords: () => {
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
                    entities: null
                });
            });
        });

        it('returns data when there is any', () => {
            // given
            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                scanRecords: () => {
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
                    entities: [{},{},{},{},{},{},{},{},{},{}]
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
                queryRecords: () => {
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
                queryRecords: () => {
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
                queryRecords: () => {
                    return Promise.resolve({ Items: [] });
                }
            });

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
            let entityController = new EC('entity');

            // when
            return entityController.queryBySecondaryIndex('field', 'index_value', 'index_name', 0, 10).then((response) => {
                // then
                expect(response.entities).to.equal(null);
            });
        });

        it('returns data when there is any', () => {
            // given
            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: () => {
                    return Promise.resolve({ Items: [{},{}] });
                }
            });

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
            let entityController = new EC('entity');

            // when
            return entityController.queryBySecondaryIndex('field', 'index_value', 'index_name', 0, 10).then((response) => {
                // then
                expect(response.entities).to.deep.equal([{}, {}]);
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

                addToSearchIndex() {
                    return Promise.resolve(true);
                }

                removeFromSearchIndex() {
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
                queryRecords: () => {
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
                queryRecords: () => {
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
                queryRecords: () => {
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

                addToSearchIndex() {
                    return Promise.resolve(true);
                }

                removeFromSearchIndex() {
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
                queryRecords: () => {
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
              queryRecords: () => {
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
                queryRecords: () => {
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
                    entities: [{},{}]
                });
            });
        });

        it('list user with search parameters and reverse order', () => {

            let params = {
                pagination: {
                    limit: 2
                },
                search: {
                    updated_at: {
                        after: ['any_data']
                    }
                },
                reverse_order: true
            };

            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters) => {
                    expect(table).to.equal('entities');
                    expect(parameters.expression_attribute_values[':updated_at_after_v']).to.deep.equal(params.search.updated_at.after);
                    expect(parameters.expression_attribute_names['#updated_at_after_k']).to.deep.equal('updated_at');
                    expect(parameters.limit).to.equal(params.pagination.limit);
                    expect(parameters.scan_index_forward).to.equal(false);
                    expect(parameters.filter_expression).to.equal('#updated_at_after_k > :updated_at_after_v');
                    return Promise.resolve({
                        Count: 2,
                        Items: [{}, {}]
                    });
                }
            });

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
            let entityController = new EC('entity');

            return entityController.listByUser(params).then((response) => {
                expect(response).to.deep.equal({
                    pagination: {
                        count: 2,
                        end_cursor: '',
                        has_next_page: 'false',
                        last_evaluated: ""
                    },
                    entities: [{},{}]
                });
            });
        });

        it('list user, filter by account', () => {

            let params = {
                pagination: {
                    limit: 2
                },
                search: {
                    updated_at: {
                        after: ['any_data']
                    }
                },
                reverse_order: true,
                append_account_filter: true
            };

            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters) => {
                    expect(table).to.equal('entities');
                    expect(parameters.expression_attribute_values[':updated_at_after_v']).to.deep.equal(params.search.updated_at.after);
                    expect(parameters.expression_attribute_names['#updated_at_after_k']).to.deep.equal('updated_at');
                    expect(parameters.limit).to.equal(params.pagination.limit);
                    expect(parameters.expression_attribute_values[':accountv']).to.equal(global.account);
                    return Promise.resolve({
                        Count: 2,
                        Items: [{}, {}]
                    });
                }
            });

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
            let entityController = new EC('entity');

            return entityController.listByUser(params).then((response) => {
                expect(response).to.deep.equal({
                    pagination: {
                        count: 2,
                        end_cursor: '',
                        has_next_page: 'false',
                        last_evaluated: ""
                    },
                    entities: [{},{}]
                });
            });
        });

        it('returns empty data when there are none', () => {

            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: () => {
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
                    entities: null
                });
            });
        });
    });

    describe('listByAccount', () => {

        it('returns data when there is any', () => {

            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: () => {
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
                    entities: [{},{}]
                });
            });
        });

        it('successfully lists by account with search and reverse order parameters', () => {

            let params = {
                pagination: {
                    limit: 2
                },
                search: {
                    updated_at: {
                        after: ['any_data']
                    }
                },
                reverse_order: true
            };

            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters) => {
                    expect(table).to.equal('entities');
                    expect(parameters.expression_attribute_values[':updated_at_after_v']).to.deep.equal(params.search.updated_at.after);
                    expect(parameters.expression_attribute_names['#updated_at_after_k']).to.deep.equal('updated_at');
                    expect(parameters.limit).to.equal(params.pagination.limit);
                    expect(parameters.scan_index_forward).to.equal(false);
                    expect(parameters.filter_expression).to.equal('#updated_at_after_k > :updated_at_after_v');
                    return Promise.resolve({
                        Count: 2,
                        Items: [{}, {}]
                    });
                }
            });

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
            let entityController = new EC('entity');

            return entityController.listByAccount(params).then((response) => {
                expect(response).to.deep.equal({
                    pagination: {
                        count: 2,
                        end_cursor: '',
                        has_next_page: 'false',
                        last_evaluated: ""
                    },
                    entities: [{},{}]
                });
            });
        });

        it('returns empty data when there are none', () => {

            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: () => {
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
                    entities: null
                });
            });
        });
    });

    describe('getListByAccount', () => {

        it('retrieves list by account', () => {

            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: () => {
                    return Promise.resolve({
                        Count: 2,
                        Items: [{}, {}]
                    });
                },
                createINQueryParameters: () => {
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
                    entities: [{},{}]
                });
            });
        });

        it('retrieves list by account with specified query parameters', () => {

            let params = {
                query_parameters: {
                    any_data: 'any_data'
                },
                pagination: {
                    limit: 2
                }
            };

            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index) => {
                    expect(table).to.equal('entities');
                    expect(index).to.equal('account-index');
                    expect(parameters.any_data).to.equal(params.query_parameters.any_data);
                    expect(parameters.filter_expression).to.equal('a_filter');
                    return Promise.resolve({
                        Count: 2,
                        Items: [{}, {}]
                    });
                },
                createINQueryParameters: (field) => {
                    expect(field).to.equal('id');
                    return {
                        filter_expression: 'a_filter',
                        expression_attribute_values: {}
                    }
                }
            });

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
            let entityController = new EC('entity');

            return entityController.getListByAccount(params).then((response) => {
                expect(response).to.deep.equal({
                    pagination: {
                        count: 2,
                        end_cursor: '',
                        has_next_page: 'false',
                        last_evaluated: ""
                    },
                    entities: [{},{}]
                });
            });
        });
    });

    describe('getListByUser', () => {

        it('retrieves list by user', () => {
            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: () => {
                    return Promise.resolve({
                        Count: 2,
                        Items: [{}, {}]
                    });
                },
                createINQueryParameters: () => {
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
                    entities: [{},{}]
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
                    },
                    reverse_order: true
                },
                pagination:{limit:2},
                index:'an_index'
            };

            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index) => {
                    expect(index).to.equal(params.index);
                    expect(table).to.equal('entities');
                    expect(parameters.scan_index_forward).to.equal(false);
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
                    entities: [{},{}]
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
                    entities: [{},{}]
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

    describe('getCount', () => {

        it('successfully returns record count', () => {

            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                countRecords: (table, additional_parameters) => {
                    expect(table).to.equal('entities');
                    expect(additional_parameters).to.have.property('filter_expression');
                    expect(additional_parameters).to.have.property('expression_attribute_values');
                    return Promise.resolve({ Count: 1});
                }
            });

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
            let entityController = new EC('entity');

            return entityController.getCount({}).then((response) => {
                expect(response).to.deep.equal({Count: 1});
            });
        });
    });

    describe('createINQueryParameters', () => {

        it('successfully creates in query parameters', () => {

            let params = {
                field: 'a_field',
                list_array: ['an_item']
            };

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                createINQueryParameters: (field_name, in_array) => {
                    expect(field_name).to.equal(params.field);
                    expect(in_array).to.equal(params.list_array);
                    return {
                        filter_expression: 'a_filter',
                        expression_attribute_values: 'an_expression_values'
                    };
                }
            });

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
            let entityController = new EC('entity');

            expect(entityController.createINQueryParameters(params)).to.deep.equal({
                filter_expression: 'a_filter',
                expression_attribute_values: 'an_expression_values'
            });
        });
    });

    describe('appendDisjunctionQueryParameters', () => {

        it('successfully creates in query parameters', () => {

            let params = {
                field_name: 'a_field',
                array: ['an_item'],
                query_parameters: {}
            };

            const EC = global.SixCRM.routes.include('controllers','entities/Entity.js');
            let entityController = new EC('entity');

            expect(entityController.appendDisjunctionQueryParameters(params)).to.deep.equal({
                expression_attribute_names: {
                    "#a_field": "a_field"
                },
                expression_attribute_values: {
                    ":a_fieldv0": "an_item"
                },
                filter_expression: "(#a_field = :a_fieldv0)"
            });
        });
    });
});

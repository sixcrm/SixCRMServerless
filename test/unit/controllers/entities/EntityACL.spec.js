let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
const uuidV4 = require('uuid/v4');
let PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators');

describe('controllers/entities/EntityACL.js', () => {

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

    describe('assure', () => {
        it('retrieves existing acl', () => {
            const params = {
                entity: uuidV4(),
                type: "emailtemplate",
                allow: ['*'],
                deny: ['*']
            };

            PermissionTestGenerators.givenUserWithAllowed('read', 'entityacl');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: () => Promise.resolve({Items: [params]})
            });

            const mock_preindexing_helper = class {
                constructor(){

                }
                addToSearchIndex(){
                    return Promise.resolve(true);
                }
                removeFromSearchIndex(){
                    return Promise.resolve(true);
                }
            };

            mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), mock_preindexing_helper);

            mockery.registerMock(global.SixCRM.routes.path('helpers', 'redshift/Activity.js'), {
                createActivity: () => Promise.resolve()
            });

            const entityACLController = global.SixCRM.routes.include('controllers','entities/EntityACL.js');

            return entityACLController.assure(params).then(result => {
                expect(result.entity).to.equal(params.entity);
                expect(result.type).to.equal(params.type);
                expect(result.allow).to.deep.equal(params.allow);
                expect(result.deny).to.deep.equal(params.deny);
            });
        });

        it('creates acl if it does not exist', () => {
            let params = {
                entity: uuidV4(),
                type: "emailtemplate",
                allow: ['*'],
                deny: ['*']
            };

            PermissionTestGenerators.givenUserWithAllowed('create', 'entityacl');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: () => Promise.resolve([]),
                saveRecord: (tableName, entity) => Promise.resolve(entity)
            });

            let mock_preindexing_helper = class {
                constructor(){}
                addToSearchIndex(){
                    return Promise.resolve(true);
                }
                removeFromSearchIndex(){
                    return Promise.resolve(true);
                }
            };

            mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), mock_preindexing_helper);

            mockery.registerMock(global.SixCRM.routes.path('helpers', 'redshift/Activity.js'), {
                createActivity: () => Promise.resolve()
            });

            let entityACLController = global.SixCRM.routes.include('controllers','entities/EntityACL.js');

            return entityACLController.assure(params).then(result => {
                expect(result.entity_type).to.equal('entityacl');
                expect(result.entity).to.equal(params.entity);
                expect(result.allow).to.deep.equal(params.allow);
                expect(result.deny).to.deep.equal(params.deny);
                expect(result.created_at).to.equal(result.updated_at);
            });
        });
    });
});

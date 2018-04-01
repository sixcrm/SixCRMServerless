let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
let PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators');
const du = global.SixCRM.routes.include('lib','debug-utilities.js');
const timestamp = global.SixCRM.routes.include('lib','timestamp.js');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');


function getValidUser() {
    return MockEntities.getValidUser()
}


describe('controllers/entities/User.js', () => {

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

    xdescribe('getFullName', () => {

        it('returns user\'s full name', () => {
            let user = getValidUser();

            const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
            const userController = new UserController();

            expect(userController.getFullName(user)).to.equal(user.first_name + ' ' + user.last_name);
        });

        it('returns only last name when first name is not a string', () => {
            let user = getValidUser();

            let non_string_values = [123, -123, 11.22, -11.22, null, {}, [], () => {}]; //not a string

            const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
            const userController = new UserController();

            non_string_values.forEach(non_string_value => {
                user.first_name = non_string_value;
                expect(userController.getFullName(user)).to.equal(user.last_name);
            });
        });

        it('returns null when user\'s first and last name are omitted', () => {
            let user = getValidUser();

            delete user.first_name;
            delete user.last_name;

            const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
            const userController = new UserController();

            expect(userController.getFullName(user)).to.equal(null);
        });
    });

    describe('appendAlias', () => {

        it('returns user itself when user alias exists', () => {
            let user = getValidUser();

            const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
            const userController = new UserController();

            expect(userController.appendAlias(user)).to.deep.equal(user);
        });

        it('successfully appends alias', () => {
            let user = getValidUser();

            delete user.alias;
            user.id = 'first.last@example.com'; //any email type id

            mockery.registerMock(global.SixCRM.routes.path('lib', 'random.js'), {
                createRandomString: () => {
                    return 'a_random_string';
                }
            });

            const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
            const userController = new UserController();

            let result = userController.appendAlias(user);

            expect(result.alias).to.equal('628243ee9c74e8b56e9026e3c26a7f53e5283037');
        });
    });

    xdescribe('getAddress', () => {

        it('returns null when user address is omitted', () => {
            let user = getValidUser(); //valid user without an address

            const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
            const userController = new UserController();

            expect(userController.getAddress(user)).to.equal(null);
        });

        it('returns user address', () => {
            let user = getValidUser();

            user.address = 'an address';

            const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
            const userController = new UserController();

            expect(userController.getAddress(user)).to.equal(user.address);
        });
    });

    describe('can', () => {

        it('returns true when action is allowed for specified user', () => {

            PermissionTestGenerators.givenUserWithAllowed('update', 'user');

            const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
            const userController = new UserController();

            return userController.can({action: 'update', id: global.user.id}).then((result) => {
                expect(result).to.equal(true);
            });
        });
    });

    describe('getHydrated', () => {
        it('returns hydrated user', () => {
            let user = getValidUser();
            let acl = {};
            const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
            const userController = new UserController();

            userController.get = () => Promise.resolve(user);
            userController.getACLPartiallyHydrated = () => Promise.resolve(acl);

            return userController.getHydrated(user.id)
            .then(result => {
                const expected = Object.assign({acl}, user);

                expect(result).to.deep.equal(expected);
            });
        });

        it('returns null if user not found', () => {
            let user = getValidUser();
            const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
            const userController = new UserController();

            userController.get = () => Promise.resolve(null);

            return userController.getHydrated(user.id)
            .then(result => {
                expect(result).to.be.null;
            });
        });

        it('rejects with server error if hydration fails', () => {
            let user = getValidUser();
            const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
            const userController = new UserController();

            userController.get = () => Promise.resolve(user);
            userController.getACLPartiallyHydrated = () => Promise.resolve({});
            userController.isPartiallyHydratedUser = () => Promise.resolve(false);
            return userController.getHydrated(user.id)
            .then(() => expect.fail())
            .catch(error => {
                expect(error.message).to.equal('[500] The user is not partially hydrated.');
            });
        });
    });

    describe('getACLPartiallyHydrated', () => {
        it('resolves with a list of hydrated acls', () => {
            let user = getValidUser();
            let acls = [
                {id: 'fake-1'},
                {id: 'fake-2'}
            ];

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/UserACL.js'), class {
                queryBySecondaryIndex({index_name, field, index_value}) {
                    expect(index_name).to.equal('user-index');
                    expect(field).to.equal('user');
                    expect(index_value).to.equal(user.id);
                    return Promise.resolve({
                        useracls: acls,
                        pagination: {}
                    });
                }
                getPartiallyHydratedACLObject(acl) {
                    acl.role = 'role';
                    acl.account = 'account';
                    return Promise.resolve(acl);
                }
            });

            const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
            const userController = new UserController();

            return userController.getACLPartiallyHydrated(user).then(result => {
                expect(result).to.deep.equal([{
                    id: 'fake-1',
                    role: 'role',
                    account: 'account'
                }, {
                    id: 'fake-2',
                    role: 'role',
                    account: 'account'
                }]);
            });
        });

        it('returns null if no acls found', () => {
            let user = getValidUser();

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/UserACL.js'), class {
                queryBySecondaryIndex() {
                    return Promise.resolve({
                        useracls: [],
                        pagination: {}
                    });
                }
            });

            const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
            const userController = new UserController();

            return userController.getACLPartiallyHydrated(user).then(result => {
                expect(result).to.be.null;
            });
        });
    });

    describe('getACL', () => {

        it('successfully retrieves user ACL by user id', () => {
            let user_without_acl = getValidUser(); //valid user without acl

            mockery.registerMock(global.SixCRM.routes.path('controllers','entities/UserACL.js'), class {
                getACLByUser({user}) {
                    expect(user).to.equal(user_without_acl.id);
                    return Promise.resolve({
                        useracls: ['userACL']
                    })
                }
            });

            const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
            const userController = new UserController();

            return userController.getACL(user_without_acl).then((result) => {
                expect(result).to.deep.equal(['userACL']);
            });
        });

        it('successfully retrieves user ACL', () => {
            let user_data = getValidUser();

            user_data.acl = ['userACL'];

            const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
            const userController = new UserController();

            expect(userController.getACL(user_data)).to.deep.equal(['userACL']);
        });
    });

    describe('getAccessKey', () => {

        it('successfully retrieves an access key', () => {
            let user = getValidUser();

            mockery.registerMock(global.SixCRM.routes.path('controllers','entities/AccessKey.js'), {
                get: ({id}) => {
                    expect(id).to.equal(user.id);
                    return Promise.resolve('an_access_key')
                }
            });

            const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
            const userController = new UserController();

            return userController.getAccessKey(user.id).then((result) => {
                expect(result).to.equal('an_access_key');
            });
        });
    });

    describe('getAccount', () => {

        it('successfully retrieves a master account', () => {

            const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
            const userController = new UserController();

            mockery.registerMock(global.SixCRM.routes.path('controllers','entities/Account.js'), {
              getMasterAccount: () => {
                return Promise.resolve({
                    "id":"*",
                    "name": "Master Account",
                    "active": true
                });
              }
            });

            return userController.getAccount('*').then((result) => {
              expect(result).to.deep.equal({
                  id: '*',
                  name: 'Master Account',
                  active: true
              });
            });
        });

        it('successfully retrieves an account', () => {

            mockery.registerMock(global.SixCRM.routes.path('controllers','entities/Account.js'), {
                get: ({id}) => {
                    expect(id).to.equal('dummy_id');
                    return Promise.resolve('an_account')
                }
            });

            const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
            const userController = new UserController();

            return userController.getAccount('dummy_id').then((result) => {
                expect(result).to.equal('an_account');
            });
        });
    });

    describe('getAccessKeyByKey', () => {

        it('successfully retrieves an access key by key', () => {
            let user = getValidUser();

            mockery.registerMock(global.SixCRM.routes.path('controllers','entities/AccessKey.js'), {
                getAccessKeyByKey: ({id}) => {
                    expect(id).to.equal(user.id);
                    return Promise.resolve('an_access_key')
                }
            });

            const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
            const userController = new UserController();

            return userController.getAccessKeyByKey(user.id).then((result) => {
                expect(result).to.equal('an_access_key');
            });
        });
    });

    describe('getUserByAccessKeyId', () => {

        it('successfully retrieves user by access key id', () => {
            let user = getValidUser();

            let mock_entity = class {
                constructor(){}

                getBySecondaryIndex({field, index_value, index_name}) {
                    expect(field).to.equal('access_key_id');
                    expect(index_value).to.equal('an_access_key_id');
                    expect(index_name).to.equal('access_key_id-index');
                    return Promise.resolve(user);
                }
            };

            mockery.registerMock(global.SixCRM.routes.path('controllers','entities/Entity.js'), mock_entity);

            const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
            const userController = new UserController();

            return userController.getUserByAccessKeyId('an_access_key_id').then((result) => {
                expect(result).to.deep.equal(user);
            });
        });
    });

    xdescribe('createUserWithAlias', () => {

        it('creates user with previously set alias', () => {

            let user = getValidUser();

            PermissionTestGenerators.givenUserWithAllowed('create', 'user');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters) => {
                    expect(table).to.equal('users');
                    expect(parameters.expression_attribute_values[':primary_keyv']).to.equal(user.id);
                    return Promise.resolve([]);
                },
                saveRecord: (tableName, entity) => {
                    expect(tableName).to.equal('users');
                    expect(entity).to.deep.equal(user);
                    return Promise.resolve(entity);
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('helpers', 'redshift/Activity.js'), class {
                createActivity() {
                    return Promise.resolve();
                }
            });

            const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
            const userController = new UserController();

            return userController.createUserWithAlias(user).then((result) => {
                expect(result.alias).to.be.defined;
                expect(result).to.deep.equal(user);
            });
        });

        it('appends user alias and creates user', () => {

            let user = getValidUser();

            delete user.alias;

            PermissionTestGenerators.givenUserWithAllowed('create', 'user');

            mockery.registerMock(global.SixCRM.routes.path('entities', 'Entity.js'), class {
              constructor(){

              }
              create({entity}){
                return Promise.resolve(entity);
              }
            });

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters) => {
                    expect(table).to.equal('users');
                    expect(parameters.expression_attribute_values[':primary_keyv']).to.equal(user.id);
                    return Promise.resolve([]);
                },
                saveRecord: (tableName, entity) => {
                    expect(tableName).to.equal('users');
                    expect(entity).to.deep.equal(user);
                    return Promise.resolve(entity);
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('helpers', 'redshift/Activity.js'), class {
                createActivity() {
                    return Promise.resolve();
                }
            });

            const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
            const userController = new UserController();

            return userController.createUserWithAlias(user).then((result) => {
                expect(result.alias).to.be.defined;
                expect(result).to.deep.equal(user);
            }).catch(error => {
              du.error(error);
            });
        });
    });

    describe('createStrict', () => {

        beforeEach(() => {
            mockery.registerMock(global.SixCRM.routes.path('analytics', 'Analytics.js'), class {
                disableACLs() {}
                enableACLs() {}
            });
        });

        it('successfully creates user strict', () => {

            let user = getValidUser();
            delete user.created_at;
            delete user.updated_at;

            PermissionTestGenerators.givenUserWithAllowed('create', 'user');
            user.id = global.user.id;

            mockery.registerMock(global.SixCRM.routes.path('entities', 'Entity.js'), class {
              constructor(){

              }
              create({entity}){
                entity.created_at = timestamp.getISO8601();
                entity.updated_at = entity.created_at;
                return Promise.resolve(entity);
              }
              disableACLs(){}
              enableACLs(){}
            });

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters) => {
                    expect(table).to.equal('users');
                    expect(parameters.expression_attribute_values[':primary_keyv']).to.equal(user.id);
                    return Promise.resolve([]);
                },
                saveRecord: (tableName, entity) => {
                    expect(tableName).to.equal('users');
                    expect(entity).to.deep.equal(user);
                    return Promise.resolve(entity);
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('helpers', 'redshift/Activity.js'), class {
                createActivity() {
                    return Promise.resolve();
                }
            });

            const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
            const userController = new UserController();

            return userController.createStrict(user).then((result) => {
              expect(result).to.deep.equal(user);
            });

        });

        it('throws error when user strict is not created', () => {
            let user = getValidUser();

            PermissionTestGenerators.givenUserWithAllowed('create', 'user');

            user.id = global.user.id;

            mockery.registerMock(global.SixCRM.routes.path('entities', 'Entity.js'), class {
              constructor(){

              }
              create({entity}){
                return Promise.resolve(entity);
              }
              disableACLs(){}
              enableACLs(){}
            });

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters) => {
                    expect(table).to.equal('users');
                    expect(parameters.expression_attribute_values[':primary_keyv']).to.equal(user.id);
                    return Promise.resolve([]);
                },
                saveRecord: (tableName, entity) => {
                    expect(tableName).to.equal('users');
                    expect(entity).to.deep.equal(user);
                    return Promise.reject(new Error('Saving failed.'));
                }
            });

            const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
            const userController = new UserController();

            return userController.createStrict(user).catch((error) => {
                expect(error.message).to.equal('Saving failed.');
            });
        });
    });

    describe('assureUser', () => {

        it('returns user when user with specified id already exists', () => {

          let user = getValidUser();

          PermissionTestGenerators.givenUserWithAllowed('*', '*');

          mockery.registerMock(global.SixCRM.routes.path('entities', 'UserSetting.js'), class {
            constructor(){}
            create(){
              return Promise.resolve
            }
          });

          mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
              queryRecords: (table, parameters) => {
                  expect(table).to.equal('users');
                  expect(parameters.expression_attribute_values[':primary_keyv']).to.equal(user.id);
                  return Promise.resolve({
                      Count: 1,
                      Items: [user]
                  });
              }
          });

          const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
          const userController = new UserController();

          return userController.assureUser(user.id).then((result) => {
              expect(result).to.equal(user);
          });

        });

        //Need appropriate mocks
        xit('successfully assures user', () => {
            let user_id = 'test@example.com';

            PermissionTestGenerators.givenUserWithAllowed('*', 'user');

            mockery.registerMock(global.SixCRM.routes.path('entities', 'Entity.js'), class {
              constructor(){

              }
              create({entity}){
                return Promise.resolve(entity);
              }
              get(){
                return Promise.resolve(null);
              }
              executeAssociatedEntityFunction(){
                return Promise.resolve({});
              }
            });

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters) => {
                    expect(table).to.equal('users');
                    expect(parameters.expression_attribute_values[':primary_keyv']).to.equal(user_id);
                    return Promise.resolve({});
                },
                saveRecord: (tableName, entity) => {
                    expect(tableName).to.equal('users');
                    expect(entity.id).to.equal(user_id);
                    expect(entity.name).to.equal(user_id);
                    expect(entity.termsandconditions).to.equal('0.0');
                    expect(entity.active).to.equal(true);
                    expect(entity.auth0id).to.equal('-');
                    expect(entity.alias).to.equal('ccc8a2908e3b3722e73c727b01adae54c6e341eb');
                    return Promise.resolve(entity);
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('lib', 'random.js'), {
                createRandomString: () => {
                    return 'a_random_string';
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/UserSetting.js'), class {
                create({entity}) {
                    expect(entity.id).to.equal(user_id);
                    expect(entity.timezone).to.equal('America/Los_Angeles');
                    expect(entity.notifications).to.deep.equal([
                        { name: 'six', receive: true },
                        { name: 'email', receive: false },
                        { name: 'sms', receive: false },
                        { name: 'slack', receive: false },
                        { name: 'skype', receive: false },
                        { name: 'ios', receive: false }
                    ]);
                    return Promise.resolve(entity)
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('helpers', 'redshift/Activity.js'), class {
                createActivity() {
                    return Promise.resolve();
                }
            });

            const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
            const userController = new UserController();

            return userController.assureUser(user_id).then((result) => {
                expect(result.active).to.equal(true);
                expect(result.alias).to.equal('ccc8a2908e3b3722e73c727b01adae54c6e341eb');
                expect(result.auth0id).to.equal('-');
                expect(result.entity_type).to.equal('user');
                expect(result.id).to.equal(user_id);
                expect(result.name).to.equal(user_id);
                expect(result.index_action).to.equal('add');
                expect(result.termsandconditions).to.equal('0.0');
            });
        });

        it('throws error when user settings are not successfully created', () => {
            let user_id = 'test@example.com';

            PermissionTestGenerators.givenUserWithAllowed('*', 'user');

            mockery.registerMock(global.SixCRM.routes.path('entities', 'Entity.js'), class {
              constructor(){

              }
              create({entity}){
                return Promise.resolve(entity);
              }
              get(){
                return Promise.resolve(null);
              }
              executeAssociatedEntityFunction(){
                return Promise.resolve({});
              }
            });

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters) => {
                    expect(table).to.equal('users');
                    expect(parameters.expression_attribute_values[':primary_keyv']).to.equal(user_id);
                    return Promise.resolve({});
                },
                saveRecord: (tableName, entity) => {
                    expect(tableName).to.equal('users');
                    expect(entity.id).to.equal(user_id);
                    expect(entity.name).to.equal(user_id);
                    expect(entity.termsandconditions).to.equal('0.0');
                    expect(entity.active).to.equal(true);
                    expect(entity.auth0id).to.equal('-');
                    expect(entity.alias).to.equal('ccc8a2908e3b3722e73c727b01adae54c6e341eb');
                    return Promise.resolve(entity);
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('lib', 'random.js'), {
                createRandomString: () => {
                    return 'a_random_string';
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('controllers','entities/UserSetting.js'), class {
                create({entity}) {
                    expect(entity.id).to.equal(user_id);
                    expect(entity.timezone).to.equal('America/Los_Angeles');
                    expect(entity.notifications).to.deep.equal([
                        { name: 'six', receive: true },
                        { name: 'email', receive: false },
                        { name: 'sms', receive: false },
                        { name: 'slack', receive: false },
                        { name: 'skype', receive: false },
                        { name: 'ios', receive: false }
                    ]);
                    return Promise.reject(new Error('User settings creating failed.'));
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('helpers', 'redshift/Activity.js'), class {
                createActivity() {
                    return Promise.resolve();
                }
            });

            const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
            const userController = new UserController();

            return userController.assureUser(user_id).catch((error) => {
                expect(error.message).to.equal('[500] Error: User settings creating failed.');
            });
        });

        it('throws error when user retrieving failed', () => {
            let user_id = 'test@example.com';

            PermissionTestGenerators.givenUserWithAllowed('*', 'user');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters) => {
                    expect(table).to.equal('users');
                    expect(parameters.expression_attribute_values[':primary_keyv']).to.equal(user_id);
                    return Promise.reject(new Error('User retrieving failed.'));
                }
            });

            const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
            const userController = new UserController();

            return userController.assureUser(user_id).catch((error) => {
                expect(error.message).to.equal('[500] User retrieving failed.');
            });
        });
    });
});

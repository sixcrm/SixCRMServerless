let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
const uuidV4 = require('uuid/v4');
let PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators');

function getValidBill() {
    return {
        "id":"b1624c17-15ad-442a-889d-1daf9278a9ae",
        "account":"d3fa3bf3-7824-49f4-8261-87674482bf1c",
        "paid":false,
        "outstanding":false,
        "period_start_at":"2017-03-01T00:00:00.001Z",
        "period_end_at":"2017-04-01T00:00:00.000Z",
        "available_at":"2017-04-01T00:00:00.000Z",
        "detail":[
            {
                "created_at":"2017-03-12T00:00:00.001Z",
                "description":"Some line item charge",
                "amount": 9.99
            },
            {
                "created_at":"2017-04-01T00:00:00.000Z",
                "description":"Subscription",
                "amount": 30.00
            },
            {
                "created_at":"2017-04-01T00:00:00.000Z",
                "description":"Transaction Fees",
                "amount": 747.48
            }
        ],
        "created_at":"2017-04-06T18:40:41.405Z",
        "updated_at":"2017-04-06T18:41:12.521Z"
    }
}
describe('controllers/entities/Bill.js', () => {

    let account_copy;

    before(() => {
        mockery.enable({
            useCleanCache: true,
            warnOnReplace: false,
            warnOnUnregistered: false
        });
    });

    beforeEach(() => {
        //global.SixCRM.localcache.clear('all');
        account_copy = global.account;

        let mock_preindexing_helper = class {
            constructor(){

            }
            addToSearchIndex(entity){
                return Promise.resolve(true);
            }
            removeFromSearchIndex(entity){
                return Promise.resolve(true);
            }
        };

        mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), mock_preindexing_helper);

        mockery.registerMock(global.SixCRM.routes.path('helpers', 'redshift/Activity.js'), {
            createActivity: () => {
                return Promise.resolve();
            }
        });

        mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/notification/notification-provider.js'), {
            createNotificationForAccountAndUser: (notification) => {
                return Promise.resolve({});
            }
        });
    });

    afterEach(() => {
        mockery.resetCache();
        mockery.deregisterAll();
        global.account = account_copy;
    });

    describe('update', () => {

        it('successfully updates bill', () => {

            let entity = getValidBill();

            PermissionTestGenerators.givenUserWithAllowed('update', 'bill', '*');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index, callback) => {
                    return Promise.resolve({Items: [entity]});
                },
                saveRecord: (tableName, entity, callback) => {
                    expect(entity).to.have.property('created_at');
                    expect(entity).to.have.property('updated_at');
                    expect(entity).to.have.property('id');
                    expect(entity.created_at).not.to.be.equal(entity.updated_at);
                    return Promise.resolve(entity);
                }
            });

            //prepare permissions
            global.account = '*';

            let billController = global.SixCRM.routes.include('controllers','entities/Bill.js');

            return billController.update({entity}).then((result) => {
                expect(result).to.equal(entity);
            });
        });

        it('throws error when user is not authorized to perform update action', () => {

            let entity = getValidBill();

            //remove permissions
            delete global.account;

            let billController = global.SixCRM.routes.include('controllers','entities/Bill.js');

            try {
                billController.update({entity})
            }catch(error) {
                expect(error.message).to.equal('[403] User is not authorized to perform this action.');
            }
        });

        it('throws error when entity does not have expected fields', () => {

            let entity = getValidBill();

            delete entity.id;

            PermissionTestGenerators.givenUserWithAllowed('update', 'bill', '*');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index, callback) => {
                    return Promise.resolve({Items: [entity]});
                },
                saveRecord: (tableName, entity, callback) => {
                    expect(entity).to.have.property('created_at');
                    expect(entity).to.have.property('updated_at');
                    expect(entity).to.have.property('id');
                    expect(entity.created_at).not.to.be.equal(entity.updated_at);
                    return Promise.resolve(entity);
                }
            });

            //prepare permissions
            global.account = '*';

            let billController = global.SixCRM.routes.include('controllers','entities/Bill.js');

            try {
                billController.update({entity})
            }catch(error) {
                expect(error.message).to.equal('[400] Unable to update bill. Missing property "id"');
            }
        });
    });

    describe('updatePaidResult', () => {

        it('successfully updates paid result', () => {

            let entity = getValidBill();

            PermissionTestGenerators.givenUserWithAllowed('update', 'bill', '*');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index, callback) => {
                    return Promise.resolve({Items: [entity]});
                },
                saveRecord: (tableName, entity, callback) => {
                    expect(entity).to.have.property('created_at');
                    expect(entity).to.have.property('updated_at');
                    expect(entity).to.have.property('id');
                    expect(entity.created_at).not.to.be.equal(entity.updated_at);
                    return Promise.resolve(entity);
                }
            });

            //prepare permissions
            global.account = '*';

            let billController = global.SixCRM.routes.include('controllers','entities/Bill.js');

            return billController.updatePaidResult({entity}).then((result) => {
                expect(result).to.equal(entity);
            });
        });

        it('throws error when entity does not have expected fields', () => {

            let entity = getValidBill();

            delete entity.id;

            PermissionTestGenerators.givenUserWithAllowed('update', 'bill', '*');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index, callback) => {
                    return Promise.resolve({Items: [entity]});
                },
                saveRecord: (tableName, entity, callback) => {
                    expect(entity).to.have.property('created_at');
                    expect(entity).to.have.property('updated_at');
                    expect(entity).to.have.property('id');
                    expect(entity.created_at).not.to.be.equal(entity.updated_at);
                    return Promise.resolve(entity);
                }
            });

            //prepare permissions
            global.account = '*';

            let billController = global.SixCRM.routes.include('controllers','entities/Bill.js');

            try {
                billController.updatePaidResult({entity})
            }catch(error) {
                expect(error.message).to.equal('[400] Unable to update bill. Missing property "id"');
            }
        });
    });

    describe('create', () => {

        it('successfully creates bill', () => {

            let entity = getValidBill();

            delete entity.updated_at; //remove unnecessary field

            PermissionTestGenerators.givenUserWithAllowed('create', 'bill', '*');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index, callback) => {
                    return Promise.resolve([]);
                },
                saveRecord: (tableName, entity, callback) => {
                    expect(entity).to.have.property('created_at');
                    expect(entity).to.have.property('updated_at');
                    expect(entity).to.have.property('id');
                    expect(entity.created_at).to.be.equal(entity.updated_at);
                    return Promise.resolve(entity);
                }
            });

            //prepare permissions
            global.account = '*';

            let billController = global.SixCRM.routes.include('controllers','entities/Bill.js');

            return billController.create({entity}).then((result) => {
                expect(result).to.equal(entity);
            });
        });

        it('throws error when user is not authorized to perform create action', () => {

            let entity = getValidBill();

            //remove permissions
            delete global.account;

            let billController = global.SixCRM.routes.include('controllers','entities/Bill.js');

            try {
                billController.create({entity})
            }catch(error) {
                expect(error.message).to.equal('[403] User is not authorized to perform this action.');
            }
        });

        it('throws error when entity does not have expected fields', () => {

            let entity = getValidBill();

            delete entity.id;

            PermissionTestGenerators.givenUserWithAllowed('create', 'bill', '*');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index, callback) => {
                    return Promise.resolve([]);
                },
                saveRecord: (tableName, entity, callback) => {
                    expect(entity).to.have.property('created_at');
                    expect(entity).to.have.property('updated_at');
                    expect(entity).to.have.property('id');
                    expect(entity.created_at).to.be.equal(entity.updated_at);
                    return Promise.resolve(entity);
                }
            });

            //prepare permissions
            global.account = '*';

            let billController = global.SixCRM.routes.include('controllers','entities/Bill.js');

            try {
                billController.create({entity})
            }catch(error) {
                expect(error.message).to.equal('[400] Unable to update bill. Missing property "id"');
            }
        });
    });
});

let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');

function getValidUserACL() {
    return {
        "id":"474e5f79-2662-49ab-a58e-8cc45e33159c",
        "account":"d3fa3bf3-7824-49f4-8261-87674482bf1c",
        "user":"nikola.bosic@coingcs.com",
        "role":"e09ac44b-6cde-4572-8162-609f6f0aeca8",
        "created_at":"2017-04-06T18:40:41.405Z",
        "updated_at":"2017-04-06T18:41:12.521Z"
    }
}

function getValidAccount() {
    return {
        "id":"d3fa3bf3-7824-49f4-8261-87674482bf1c",
        "name": "E2E Test Acc",
        "active":true,
        "created_at":"2017-04-06T18:40:41.405Z",
        "updated_at":"2017-04-06T18:41:12.521Z"

    }
}

function getValidRole() {
    return {
        "id":"e09ac44b-6cde-4572-8162-609f6f0aeca8",
        "name": "No Permissions",
        "active":true,
        "permissions":{
            "allow":[],
            "deny":["*"]
        },
        "created_at":"2017-04-06T18:40:41.405Z",
        "updated_at":"2017-04-06T18:41:12.521Z"
    }
}

describe('controllers/entities/UserACL.js', () => {

    before(() => {
        mockery.enable({
            useCleanCache: true,
            warnOnReplace: false,
            warnOnUnregistered: false
        });
    });

    beforeEach(() => {
        global.SixCRM.localcache.clear('all');
    });

    afterEach(() => {
        mockery.resetCache();
        mockery.deregisterAll();
    });

    describe('getAccount', () => {

        it('retrieves an account based on user ACL id', () => {
            let userACL = getValidUserACL();

            let account = getValidAccount();

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Account.js'), {
                get: (an_account) => {
                    expect(an_account.id).to.equal(userACL.account);
                    return Promise.resolve(account);
                }
            });

            let userACLController = global.SixCRM.routes.include('controllers','entities/UserACL.js');

            return userACLController.getAccount(userACL).then((result) => {
                expect(result).to.deep.equal(account);
            });
        });
    });

    describe('getRole', () => {

        it('retrieves role based on user ACL id', () => {
            let userACL = getValidUserACL();

            let role = getValidRole();

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Role.js'), {
                get: (a_role) => {
                    expect(a_role.id).to.equal(userACL.role);
                    return Promise.resolve(role);
                }
            });

            let userACLController = global.SixCRM.routes.include('controllers','entities/UserACL.js');

            return userACLController.getRole(userACL).then((result) => {
                expect(result).to.deep.equal(role);
            });
        });
    });
});
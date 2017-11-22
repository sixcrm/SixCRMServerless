const chai = require('chai');
const expect = chai.expect;
const mockery = require('mockery');

function getValidRoleConfigForOwnerRole() {
    return {
        "id":"cae614de-ce8a-40b9-8137-3d3bdff78039",
        "name": "Owner",
        "active": true,
        "permissions":{
            "allow":[
                "*"
            ]
        }
    }
}

function getValidRoleConfigForSomeOtherRole() {
    return {
        "id":"1116c054-42bb-4bf5-841e-ee0c413fa69e",
        "name": "Customer Service",
        "active": true,
        "permissions":{
            "allow":[
                "customer/*",
                "customernote/*",
                "productschedule/*",
                "product/*",
                "role/read",
                "rebill/*",
                "session/*",
                "shippingreceipt/*",
                "transaction/*",
                "role/read",
                "notification/*",
                "notificationread/*",
                "user/read",
                "account/read",
                "usersetting/*",
                "usersigningstring/*",
                "userdevicetoken/*",
                "analytics/getActivityByIdentifier"
            ],
            "deny":["*"]
        }
    }
}

function getValidJWT() {
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InN1cGVyLnVzZXJAdGVzdC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6Ly9zaXhjcm0uYXV0aDAuY29tLyIsInN1YiI6Imdvb2dsZS1vYXV0aDJ8MTE1MDIxMzEzNTg2MTA3ODAzODQ2IiwiYXVkIjoiIiwiZXhwIjoxNTEwNjYzNTE4LCJpYXQiOjE1MTA2NTk5MTh9.G-w_O7v2pS-wyKeMnJpC4kWrneyKg_CEfYM8dEJQz5k';
}

describe('lib/test-utilities', () => {

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

    describe('getRole', () => {

        it('returns role config data for specified role', () => {

            const testutilities = global.SixCRM.routes.include('lib', 'test-utilities.js');

            //Send valid role name
            expect(testutilities.getRole('Owner')).to.deep.equal(getValidRoleConfigForOwnerRole());
        });

        it('returns role config data for specified role', () => {

            const testutilities = global.SixCRM.routes.include('lib', 'test-utilities.js');

            //Send invalid role name
            try {
                testutilities.getRole('Non-existing')
            } catch (error) {
                expect(error.message).to.equal('[404] Undefined Role.');
            }
        });
    });

    describe('makeGeneralizedResultName', () => {

        it('removes underscore characters', () => {

            const testutilities = global.SixCRM.routes.include('lib', 'test-utilities.js');

            expect(testutilities.makeGeneralizedResultName('any_name')).to.equal('anyname');
        });
    });

    describe('getRoleAllowRules', () => {

        it('returns permissions for specified role for all actions', () => {

            const testutilities = global.SixCRM.routes.include('lib', 'test-utilities.js');

            expect(testutilities.getRoleAllowRules('roles', getValidRoleConfigForOwnerRole())).to.deep.equal([ '*', 'read' ]);
        });

        it('returns individual permissions for specified role', () => {

            const testutilities = global.SixCRM.routes.include('lib', 'test-utilities.js');

            //send valid key name
            expect(testutilities.getRoleAllowRules('user', getValidRoleConfigForSomeOtherRole())).to.deep.equal(['read']);
        });
    });

    describe('createTestAuth0JWT', () => {

        it('creates test auth with valid user data', () => {

            mockery.registerMock('jsonwebtoken', {
                sign: () => {
                    return getValidJWT();
                },
                verify: () => {
                    return true;
                }
            });

            const testutilities = global.SixCRM.routes.include('lib', 'test-utilities.js');

            //send valid user
            expect(testutilities.createTestAuth0JWT('super.user@test.com', 'a_secret_key')).to.equal(getValidJWT());
        });

        it('creates test auth with valid admin data', () => {

            mockery.registerMock('jsonwebtoken', {
                sign: () => {
                    return getValidJWT();
                },
                verify: () => {
                    return true;
                }
            });

            const testutilities = global.SixCRM.routes.include('lib', 'test-utilities.js');

            //send valid user
            expect(testutilities.createTestAuth0JWT('admin.user@test.com', 'a_secret_key')).to.equal(getValidJWT());
        });

        it('creates test auth with valid customer service data', () => {

            mockery.registerMock('jsonwebtoken', {
                sign: () => {
                    return getValidJWT();
                },
                verify: () => {
                    return true;
                }
            });

            const testutilities = global.SixCRM.routes.include('lib', 'test-utilities.js');

            //send valid user
            expect(testutilities.createTestAuth0JWT('customerservice.user@test.com', 'a_secret_key')).to.equal(getValidJWT());
        });

        it('creates test auth with \'unknown\' type', () => {

            mockery.registerMock('jsonwebtoken', {
                sign: () => {
                    return getValidJWT();
                },
                verify: () => {
                    return true;
                }
            });

            const testutilities = global.SixCRM.routes.include('lib', 'test-utilities.js');

            //send valid user
            expect(testutilities.createTestAuth0JWT('unknown.user@test.com', 'a_secret_key')).to.equal(getValidJWT());
        });

        it('throws unidentified user type error', () => {

            mockery.registerMock('jsonwebtoken', {
                sign: () => {
                    return getValidJWT();
                },
                verify: () => {
                    return true;
                }
            });

            const testutilities = global.SixCRM.routes.include('lib', 'test-utilities.js');

            //send invalid user
            try {
                testutilities.createTestAuth0JWT('not_valid', 'a_secret_key')
            } catch (error) {
                expect(error.message).to.equal('[500] Unidentified user type: not_valid');
            }
        });
    });

    describe('createTestTransactionJWT', () => {

        it('creates test transaction JWT', () => {

            mockery.registerMock('jsonwebtoken', {
                sign: () => {
                    return getValidJWT();
                }
            });

            const testutilities = global.SixCRM.routes.include('lib', 'test-utilities.js');

            expect(testutilities.createTestTransactionJWT()).to.equal(getValidJWT());
        });
    });

    describe('getSearchParameters', () => {

        it('retrieves search parameters from file', () => {

            let a_content_of_file = '{"body": "Example\ndata"}';

            mockery.registerMock('fs', {
                readFileSync: () => {
                    return a_content_of_file;
                }
            });

            const testutilities = global.SixCRM.routes.include('lib', 'test-utilities.js');

            expect(testutilities.getSearchParameters('a_path')).to.equal('Example data');
        });
    });

    describe('getQuery', () => {

        it('retrieves query from file', () => {

            let a_content_of_file = '{"body": "Example\ndata"}';

            mockery.registerMock('fs', {
                readFileSync: () => {
                    return a_content_of_file;
                }
            });

            const testutilities = global.SixCRM.routes.include('lib', 'test-utilities.js');

            expect(testutilities.getQuery('a_path')).to.equal('Example data');
        });
    });

    describe('generateJWT', () => {

        it('throws error when token is invalid', () => {

            mockery.registerMock('jsonwebtoken', {
                sign: () => {
                    return 'an_invalid_token';
                },
                verify: () => {
                    return false;
                }
            });

            const testutilities = global.SixCRM.routes.include('lib', 'test-utilities.js');

            try {
                testutilities.generateJWT('a_body', 'a_secret')
            } catch (error) {
                expect(error.message).to.equal('[500] created invalid token');
            }
        });
    });

    describe('validateGraphResponse', () => {

        it('validates graph response', () => {

            mockery.registerMock(global.SixCRM.routes.path('lib', 'model-validator-utilities.js'), {
                validateModel: () => {
                    return true;
                }
            });

            const testutilities = global.SixCRM.routes.include('lib', 'test-utilities.js');

            expect(testutilities.validateGraphResponse('a_response', 'a_graph_model_name')).to.be.true;
        });
    });

});
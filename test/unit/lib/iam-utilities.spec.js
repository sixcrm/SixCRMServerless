const chai = require('chai');
const expect = chai.expect;

describe('lib/iam-utilities', () => {

    describe('createRole', () => {

        it('returns data from iam utilities create role', () => {

            const iamutilities = global.SixCRM.routes.include('lib', 'iam-utilities.js');

            iamutilities.iam = {
                createRole: function(params, callback) {
                    callback(null, 'any_role_data')
                }
            };

            return iamutilities.createRole('any_params').then((result) => {
                expect(result).to.equal('any_role_data');
            });
        });

        it('throws error from iam utilities create role', () => {

            const iamutilities = global.SixCRM.routes.include('lib', 'iam-utilities.js');

            iamutilities.iam = {
                createRole: function(params, callback) {
                    callback('fail', null)
                }
            };

            return iamutilities.createRole('any_params').catch((error) => {
                expect(error.message).to.equal('[500] fail');
            });
        });
    });

    describe('roleExists', () => {

        it('returns false if role doesn\'t exists', () => {

            const iamutilities = global.SixCRM.routes.include('lib', 'iam-utilities.js');

            iamutilities.iam = {
                getRole: function(params, callback) {
                    callback(null, 'role_not_found')
                }
            };

            return iamutilities.roleExists('any_params').then((result) => {
                expect(result).to.be.false;
            });
        });

        it('returns true if role exists', () => {

            const iamutilities = global.SixCRM.routes.include('lib', 'iam-utilities.js');

            iamutilities.iam = {
                getRole: function(params, callback) {
                    callback(null, {Role: 'any_role_data'})
                }
            };

            return iamutilities.roleExists('any_params').then((result) => {
                expect(result).to.deep.equal({Role: 'any_role_data'});
            });
        });

        it('throws error from iam utilities get role', () => {

            const iamutilities = global.SixCRM.routes.include('lib', 'iam-utilities.js');

            iamutilities.iam = {
                getRole: function(params, callback) {
                    callback('fail', null)
                }
            };

            return iamutilities.roleExists('any_params').catch((error) => {
                expect(error.message).to.equal('[500] fail');
            });
        });

        it('returns false when NoSuchEntity error is returned from iam get role', () => {

            const iamutilities = global.SixCRM.routes.include('lib', 'iam-utilities.js');

            iamutilities.iam = {
                getRole: function(params, callback) {
                    callback({code: 'NoSuchEntity'}, null)
                }
            };

            return iamutilities.roleExists('any_params').then((result) => {
                expect(result).to.be.false;
            });
        });
    });

    describe('deleteRole', () => {

        it('returns data from iam utilities delete role', () => {

            const iamutilities = global.SixCRM.routes.include('lib', 'iam-utilities.js');

            iamutilities.iam = {
                deleteRole: function(params, callback) {
                    callback(null, 'any_role_data')
                }
            };

            return iamutilities.deleteRole('any_params').then((result) => {
                expect(result).to.equal('any_role_data');
            });
        });

        it('throws error from iam utilities delete role', () => {

            const iamutilities = global.SixCRM.routes.include('lib', 'iam-utilities.js');

            iamutilities.iam = {
                deleteRole: function(params, callback) {
                    callback('fail', null)
                }
            };

            return iamutilities.deleteRole('any_params').catch((error) => {
                expect(error.message).to.equal('[500] fail');
            });
        });
    });

    describe('getRole', () => {

        it('returns data from iam utilities get role', () => {

            const iamutilities = global.SixCRM.routes.include('lib', 'iam-utilities.js');

            iamutilities.iam = {
                getRole: function(params, callback) {
                    callback(null, 'any_role_data')
                }
            };

            return iamutilities.getRole('any_params').then((result) => {
                expect(result).to.equal('any_role_data');
            });
        });

        it('throws error from iam utilities get role', () => {

            const iamutilities = global.SixCRM.routes.include('lib', 'iam-utilities.js');

            iamutilities.iam = {
                getRole: function(params, callback) {
                    callback('fail', null)
                }
            };

            return iamutilities.getRole('any_params').catch((error) => {
                expect(error).to.equal('fail');
            });
        });
    });

    describe('attachRolePolicy', () => {

        it('returns data from iam utilities attach role', () => {

            const iamutilities = global.SixCRM.routes.include('lib', 'iam-utilities.js');

            iamutilities.iam = {
                attachRolePolicy: function(params, callback) {
                    callback(null, 'any_role_data')
                }
            };

            return iamutilities.attachRolePolicy('any_params').then((result) => {
                expect(result).to.equal('any_role_data');
            });
        });

        it('throws error from iam utilities attach role', () => {

            const iamutilities = global.SixCRM.routes.include('lib', 'iam-utilities.js');

            iamutilities.iam = {
                attachRolePolicy: function(params, callback) {
                    callback('fail', null)
                }
            };

            return iamutilities.attachRolePolicy('any_params').catch((error) => {
                expect(error.message).to.equal('[500] fail');
            });
        });
    });

    describe('detachRolePolicy', () => {

        it('returns data from iam utilities detach role', () => {

            const iamutilities = global.SixCRM.routes.include('lib', 'iam-utilities.js');

            iamutilities.iam = {
                detachRolePolicy: function(params, callback) {
                    callback(null, 'any_role_data')
                }
            };

            return iamutilities.detachRolePolicy('any_params').then((result) => {
                expect(result).to.equal('any_role_data');
            });
        });

        it('throws error from iam utilities detach role', () => {

            const iamutilities = global.SixCRM.routes.include('lib', 'iam-utilities.js');

            iamutilities.iam = {
                detachRolePolicy: function(params, callback) {
                    callback('fail', null)
                }
            };

            return iamutilities.detachRolePolicy('any_params').catch((error) => {
                expect(error.message).to.equal('[500] fail');
            });
        });
    });

    describe('listAttachedRolePolicies', () => {

        it('returns data from iam utilities list attached role', () => {

            const iamutilities = global.SixCRM.routes.include('lib', 'iam-utilities.js');

            iamutilities.iam = {
                listAttachedRolePolicies: function(params, callback) {
                    callback(null, 'any_role_data')
                }
            };

            return iamutilities.listAttachedRolePolicies('any_params').then((result) => {
                expect(result).to.equal('any_role_data');
            });
        });

        it('throws error from iam utilities list attached role', () => {

            const iamutilities = global.SixCRM.routes.include('lib', 'iam-utilities.js');

            iamutilities.iam = {
                listAttachedRolePolicies: function(params, callback) {
                    callback('fail', null)
                }
            };

            return iamutilities.listAttachedRolePolicies('any_params').catch((error) => {
                expect(error.message).to.equal('[500] fail');
            });
        });
    });

    describe('createPolicy', () => {

        it('returns data from iam utilities create policy', () => {

            let params = 'any_params';

            const iamutilities = global.SixCRM.routes.include('lib', 'iam-utilities.js');

            iamutilities.iam = {
                createPolicy: function(params, callback) {
                    expect(params).to.equal(params);
                    callback(null, 'any_policy_data')
                }
            };

            return iamutilities.createPolicy(params).then((result) => {
                expect(result).to.equal('any_policy_data');
            });
        });

        it('throws error from iam utilities create policy', () => {

            let params = 'any_params';

            const iamutilities = global.SixCRM.routes.include('lib', 'iam-utilities.js');

            iamutilities.iam = {
                createPolicy: function(params, callback) {
                    expect(params).to.equal(params);
                    callback('fail', null)
                }
            };

            return iamutilities.createPolicy(params).catch((error) => {
                expect(error.message).to.equal('[500] fail');
            });
        });
    });

    describe('getPolicy', () => {

        it('returns data from iam utilities get policy', () => {

            let params = 'any_params';

            const iamutilities = global.SixCRM.routes.include('lib', 'iam-utilities.js');

            iamutilities.iam = {
                getPolicy: function(params, callback) {
                    expect(params).to.equal(params);
                    callback(null, 'any_policy_data')
                }
            };

            return iamutilities.getPolicy(params).then((result) => {
                expect(result).to.equal('any_policy_data');
            });
        });

        it('throws internal server error from iam utilities get policy', () => {

            let params = 'any_params';

            const iamutilities = global.SixCRM.routes.include('lib', 'iam-utilities.js');

            iamutilities.iam = {
                getPolicy: function(params, callback) {
                    expect(params).to.equal(params);
                    callback('fail', null)
                }
            };

            return iamutilities.getPolicy(params).catch((error) => {
                expect(error.message).to.equal('[500] Internal Server Error');
            });
        });

        it('returns null when error is thrown from iam utilities get policy', () => {

            let params = 'any_params';

            const iamutilities = global.SixCRM.routes.include('lib', 'iam-utilities.js');

            iamutilities.iam = {
                getPolicy: function(params, callback) {
                    expect(params).to.equal(params);
                    callback({statusCode: 404}, null)
                }
            };

            return iamutilities.getPolicy(params).then((result) => {
                expect(result).to.equal(null);
            });
        });
    });

    describe('deletePolicy', () => {

        it('returns data from iam utilities delete policy', () => {

            let params = 'any_params';

            const iamutilities = global.SixCRM.routes.include('lib', 'iam-utilities.js');

            iamutilities.iam = {
                deletePolicy: function(params, callback) {
                    expect(params).to.equal(params);
                    callback(null, 'any_policy_data')
                }
            };

            return iamutilities.deletePolicy(params).then((result) => {
                expect(result).to.equal('any_policy_data');
            });
        });

        it('throws error from iam utilities delete policy', () => {

            let params = 'any_params';

            const iamutilities = global.SixCRM.routes.include('lib', 'iam-utilities.js');

            iamutilities.iam = {
                deletePolicy: function(params, callback) {
                    expect(params).to.equal(params);
                    callback('fail', null)
                }
            };

            return iamutilities.deletePolicy(params).catch((error) => {
                expect(error.message).to.equal('[500] fail');
            });
        });
    });

    describe('listEntitiesForPolicy', () => {

        it('returns data from iam utilities list entities for policy', () => {

            let params = 'any_params';

            const iamutilities = global.SixCRM.routes.include('lib', 'iam-utilities.js');

            iamutilities.iam = {
                listEntitiesForPolicy: function(params, callback) {
                    expect(params).to.equal(params);
                    callback(null, 'any_policy_data')
                }
            };

            return iamutilities.listEntitiesForPolicy(params).then((result) => {
                expect(result).to.equal('any_policy_data');
            });
        });

        it('throws error from iam utilities list entities for policy', () => {

            let params = 'any_params';

            const iamutilities = global.SixCRM.routes.include('lib', 'iam-utilities.js');

            iamutilities.iam = {
                listEntitiesForPolicy: function(params, callback) {
                    expect(params).to.equal(params);
                    callback('fail', null)
                }
            };

            return iamutilities.listEntitiesForPolicy(params).catch((error) => {
                expect(error.message).to.equal('[500] fail');
            });
        });
    });

    describe('createInstanceProfile', () => {

        it('returns data from iam utilities create instance profile', () => {

            let params = 'any_params';

            const iamutilities = global.SixCRM.routes.include('lib', 'iam-utilities.js');

            iamutilities.iam = {
                createInstanceProfile: function(params, callback) {
                    expect(params).to.equal(params);
                    callback(null, 'any_profile_data')
                }
            };

            return iamutilities.createInstanceProfile(params).then((result) => {
                expect(result).to.equal('any_profile_data');
            });
        });

        it('throws error from iam utilities create instance profile', () => {

            let params = 'any_params';

            const iamutilities = global.SixCRM.routes.include('lib', 'iam-utilities.js');

            iamutilities.iam = {
                createInstanceProfile: function(params, callback) {
                    expect(params).to.equal(params);
                    callback('fail', null)
                }
            };

            return iamutilities.createInstanceProfile(params).catch((error) => {
                expect(error.message).to.equal('[500] fail');
            });
        });
    });

    describe('addRoleToInstanceProfile', () => {

        it('returns data from iam utilities add role to instance profile', () => {

            let params = 'any_params';

            const iamutilities = global.SixCRM.routes.include('lib', 'iam-utilities.js');

            iamutilities.iam = {
                addRoleToInstanceProfile: function(params, callback) {
                    expect(params).to.equal(params);
                    callback(null, 'any_role_data')
                }
            };

            return iamutilities.addRoleToInstanceProfile(params).then((result) => {
                expect(result).to.equal('any_role_data');
            });
        });

        it('throws error from iam utilities add role to instance profile', () => {

            let params = 'any_params';

            const iamutilities = global.SixCRM.routes.include('lib', 'iam-utilities.js');

            iamutilities.iam = {
                addRoleToInstanceProfile: function(params, callback) {
                    expect(params).to.equal(params);
                    callback('fail', null)
                }
            };

            return iamutilities.addRoleToInstanceProfile(params).catch((error) => {
                expect(error.message).to.equal('[500] fail');
            });
        });
    });
});
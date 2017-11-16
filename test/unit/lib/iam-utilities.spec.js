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
});
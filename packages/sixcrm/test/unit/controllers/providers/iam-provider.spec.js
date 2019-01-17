const chai = require('chai');
const expect = chai.expect;
const AWSTestUtils = require('./aws-test-utils');

describe('controllers/providers/iam-provider', () => {

	describe('createRole', () => {

		it('returns data from iam utilities create role', () => {

			const IAMProvider = global.SixCRM.routes.include('controllers', 'providers/iam-provider.js');
			const iamprovider = new IAMProvider();

			iamprovider.iam = {
				createRole: AWSTestUtils.AWSPromise('any_role_data')
			};

			return iamprovider.createRole('any_params').then((result) => {
				expect(result).to.equal('any_role_data');
			});
		});

		it('throws error from iam utilities create role', () => {

			const IAMProvider = global.SixCRM.routes.include('controllers', 'providers/iam-provider.js');
			const iamprovider = new IAMProvider();

			iamprovider.iam = {
				createRole: AWSTestUtils.AWSError('fail')
			};

			return iamprovider.createRole('any_params').catch((error) => {
				expect(error.message).to.equal('fail');
			});
		});
	});

	describe('roleExists', () => {

		it('returns false if role doesn\'t exists', () => {

			const IAMProvider = global.SixCRM.routes.include('controllers', 'providers/iam-provider.js');
			const iamprovider = new IAMProvider();

			iamprovider.iam = {
				getRole: AWSTestUtils.AWSPromise('role_not_found')
			};

			return iamprovider.roleExists('any_params').then((result) => {
				expect(result).to.be.false;
			});
		});

		it('returns true if role exists', () => {

			const IAMProvider = global.SixCRM.routes.include('controllers', 'providers/iam-provider.js');
			const iamprovider = new IAMProvider();

			iamprovider.iam = {
				getRole: AWSTestUtils.AWSPromise({Role: 'any_role_data'})
			};

			return iamprovider.roleExists('any_params').then((result) => {
				expect(result).to.deep.equal({Role: 'any_role_data'});
			});
		});

		it('throws error from iam utilities get role', () => {

			const IAMProvider = global.SixCRM.routes.include('controllers', 'providers/iam-provider.js');
			const iamprovider = new IAMProvider();

			iamprovider.iam = {
				getRole: AWSTestUtils.AWSError('fail')
			};

			return iamprovider.roleExists('any_params').catch((error) => {
				expect(error.message).to.equal('[500] Error: fail');
			});
		});

		it('returns false when NoSuchEntity error is returned from iam get role', () => {

			const IAMProvider = global.SixCRM.routes.include('controllers', 'providers/iam-provider.js');
			const iamprovider = new IAMProvider();

			iamprovider.iam = {
				getRole: AWSTestUtils.AWSError({code: 'NoSuchEntity'})
			};

			return iamprovider.roleExists('any_params').then((result) => {
				expect(result).to.be.false;
			});
		});
	});

	describe('deleteRole', () => {

		it('returns data from iam utilities delete role', () => {

			const IAMProvider = global.SixCRM.routes.include('controllers', 'providers/iam-provider.js');
			const iamprovider = new IAMProvider();

			iamprovider.iam = {
				deleteRole: AWSTestUtils.AWSPromise('any_role_data')
			};

			return iamprovider.deleteRole('any_params').then((result) => {
				expect(result).to.equal('any_role_data');
			});
		});

		it('throws error from iam utilities delete role', () => {

			const IAMProvider = global.SixCRM.routes.include('controllers', 'providers/iam-provider.js');
			const iamprovider = new IAMProvider();

			iamprovider.iam = {
				deleteRole: AWSTestUtils.AWSPromise('fail')
			};

			return iamprovider.deleteRole('any_params').catch((error) => {
				expect(error.message).to.equal('fail');
			});
		});
	});

	describe('getRole', () => {

		it('returns data from iam utilities get role', () => {

			const IAMProvider = global.SixCRM.routes.include('controllers', 'providers/iam-provider.js');
			const iamprovider = new IAMProvider();

			iamprovider.iam = {
				getRole: AWSTestUtils.AWSPromise('any_role_data')
			};

			return iamprovider.getRole('any_params').then((result) => {
				expect(result).to.equal('any_role_data');
			});
		});

		it('throws error from iam utilities get role', () => {

			const IAMProvider = global.SixCRM.routes.include('controllers', 'providers/iam-provider.js');
			const iamprovider = new IAMProvider();

			iamprovider.iam = {
				getRole: AWSTestUtils.AWSError('fail')
			};

			return iamprovider.getRole('any_params').catch((error) => {
				expect(error.message).to.equal('fail');
			});
		});
	});

	describe('attachRolePolicy', () => {

		it('returns data from iam utilities attach role', () => {

			const IAMProvider = global.SixCRM.routes.include('controllers', 'providers/iam-provider.js');
			const iamprovider = new IAMProvider();

			iamprovider.iam = {
				attachRolePolicy: AWSTestUtils.AWSPromise('any_role_data')
			};

			return iamprovider.attachRolePolicy('any_params').then((result) => {
				expect(result).to.equal('any_role_data');
			});
		});

		it('throws error from iam utilities attach role', () => {

			const IAMProvider = global.SixCRM.routes.include('controllers', 'providers/iam-provider.js');
			const iamprovider = new IAMProvider();

			iamprovider.iam = {
				attachRolePolicy: AWSTestUtils.AWSError('fail')
			};

			return iamprovider.attachRolePolicy('any_params').catch((error) => {
				expect(error.message).to.equal('fail');
			});
		});
	});

	describe('detachRolePolicy', () => {

		it('returns data from iam utilities detach role', () => {

			const IAMProvider = global.SixCRM.routes.include('controllers', 'providers/iam-provider.js');
			const iamprovider = new IAMProvider();

			iamprovider.iam = {
				detachRolePolicy: AWSTestUtils.AWSPromise('any_role_data')
			};

			return iamprovider.detachRolePolicy('any_params').then((result) => {
				expect(result).to.equal('any_role_data');
			});
		});

		it('throws error from iam utilities detach role', () => {

			const IAMProvider = global.SixCRM.routes.include('controllers', 'providers/iam-provider.js');
			const iamprovider = new IAMProvider();

			iamprovider.iam = {
				detachRolePolicy: AWSTestUtils.AWSError('fail')
			};

			return iamprovider.detachRolePolicy('any_params').catch((error) => {
				expect(error.message).to.equal('fail');
			});
		});
	});

	describe('listAttachedRolePolicies', () => {

		it('returns data from iam utilities list attached role', () => {

			const IAMProvider = global.SixCRM.routes.include('controllers', 'providers/iam-provider.js');
			const iamprovider = new IAMProvider();

			iamprovider.iam = {
				listAttachedRolePolicies: AWSTestUtils.AWSPromise('any_role_data')
			};

			return iamprovider.listAttachedRolePolicies('any_params').then((result) => {
				expect(result).to.equal('any_role_data');
			});
		});

		it('throws error from iam utilities list attached role', () => {

			const IAMProvider = global.SixCRM.routes.include('controllers', 'providers/iam-provider.js');
			const iamprovider = new IAMProvider();

			iamprovider.iam = {
				listAttachedRolePolicies: AWSTestUtils.AWSError('fail')
			};

			return iamprovider.listAttachedRolePolicies('any_params').catch((error) => {
				expect(error.message).to.equal('fail');
			});
		});
	});

	describe('createPolicy', () => {

		it('returns data from iam utilities create policy', () => {

			let params = 'any_params';

			const IAMProvider = global.SixCRM.routes.include('controllers', 'providers/iam-provider.js');
			const iamprovider = new IAMProvider();

			iamprovider.iam = {
				createPolicy: AWSTestUtils.AWSPromise('any_policy_data')
			};

			return iamprovider.createPolicy(params).then((result) => {
				expect(result).to.equal('any_policy_data');
			});
		});

		it('throws error from iam utilities create policy', () => {

			let params = 'any_params';

			const IAMProvider = global.SixCRM.routes.include('controllers', 'providers/iam-provider.js');
			const iamprovider = new IAMProvider();

			iamprovider.iam = {
				createPolicy: AWSTestUtils.AWSError('fail')
			};

			return iamprovider.createPolicy(params).catch((error) => {
				expect(error.message).to.equal('fail');
			});
		});
	});

	describe('getPolicy', () => {

		it('returns data from iam utilities get policy', () => {

			let params = 'any_params';

			const IAMProvider = global.SixCRM.routes.include('controllers', 'providers/iam-provider.js');
			const iamprovider = new IAMProvider();

			iamprovider.iam = {
				getPolicy: function(params, callback) {
					expect(params).to.equal(params);
					callback(null, 'any_policy_data')
				}
			};

			return iamprovider.getPolicy(params).then((result) => {
				expect(result).to.equal('any_policy_data');
			});
		});

		it('throws internal server error from iam utilities get policy', () => {

			let params = 'any_params';

			const IAMProvider = global.SixCRM.routes.include('controllers', 'providers/iam-provider.js');
			const iamprovider = new IAMProvider();

			iamprovider.iam = {
				getPolicy: function(params, callback) {
					expect(params).to.equal(params);
					callback('fail', null)
				}
			};

			return iamprovider.getPolicy(params).catch((error) => {
				expect(error.message).to.equal('[500] Internal Server Error');
			});
		});

		it('returns null when error is thrown from iam utilities get policy', () => {

			let params = 'any_params';

			const IAMProvider = global.SixCRM.routes.include('controllers', 'providers/iam-provider.js');
			const iamprovider = new IAMProvider();

			iamprovider.iam = {
				getPolicy: function(params, callback) {
					expect(params).to.equal(params);
					callback({statusCode: 404}, null)
				}
			};

			return iamprovider.getPolicy(params).then((result) => {
				expect(result).to.equal(null);
			});
		});
	});

	describe('deletePolicy', () => {

		it('returns data from iam utilities delete policy', () => {

			let params = 'any_params';

			const IAMProvider = global.SixCRM.routes.include('controllers', 'providers/iam-provider.js');
			const iamprovider = new IAMProvider();

			iamprovider.iam = {
				deletePolicy: AWSTestUtils.AWSPromise('any_policy_data')
			};

			return iamprovider.deletePolicy(params).then((result) => {
				expect(result).to.equal('any_policy_data');
			});
		});

		it('throws error from iam utilities delete policy', () => {

			let params = 'any_params';

			const IAMProvider = global.SixCRM.routes.include('controllers', 'providers/iam-provider.js');
			const iamprovider = new IAMProvider();

			iamprovider.iam = {
				deletePolicy: AWSTestUtils.AWSError('fail')
			};

			return iamprovider.deletePolicy(params).catch((error) => {
				expect(error.message).to.equal('fail');
			});
		});
	});

	describe('listEntitiesForPolicy', () => {

		it('returns data from iam utilities list entities for policy', () => {

			let params = 'any_params';

			const IAMProvider = global.SixCRM.routes.include('controllers', 'providers/iam-provider.js');
			const iamprovider = new IAMProvider();

			iamprovider.iam = {
				listEntitiesForPolicy: AWSTestUtils.AWSPromise('any_policy_data')
			};

			return iamprovider.listEntitiesForPolicy(params).then((result) => {
				expect(result).to.equal('any_policy_data');
			});
		});

		it('throws error from iam utilities list entities for policy', () => {

			let params = 'any_params';

			const IAMProvider = global.SixCRM.routes.include('controllers', 'providers/iam-provider.js');
			const iamprovider = new IAMProvider();

			iamprovider.iam = {
				listEntitiesForPolicy: AWSTestUtils.AWSError('fail')
			};

			return iamprovider.listEntitiesForPolicy(params).catch((error) => {
				expect(error.message).to.equal('fail');
			});
		});
	});

	describe('createInstanceProfile', () => {

		it('returns data from iam utilities create instance profile', () => {

			let params = 'any_params';

			const IAMProvider = global.SixCRM.routes.include('controllers', 'providers/iam-provider.js');
			const iamprovider = new IAMProvider();

			iamprovider.iam = {
				createInstanceProfile: AWSTestUtils.AWSPromise('any_profile_data')
			};

			return iamprovider.createInstanceProfile(params).then((result) => {
				expect(result).to.equal('any_profile_data');
			});
		});

		it('throws error from iam utilities create instance profile', () => {

			let params = 'any_params';

			const IAMProvider = global.SixCRM.routes.include('controllers', 'providers/iam-provider.js');
			const iamprovider = new IAMProvider();

			iamprovider.iam = {
				createInstanceProfile: AWSTestUtils.AWSError('fail')
			};

			return iamprovider.createInstanceProfile(params).catch((error) => {
				expect(error.message).to.equal('fail');
			});
		});
	});

	describe('addRoleToInstanceProfile', () => {

		it('returns data from iam utilities add role to instance profile', () => {

			let params = 'any_params';

			const IAMProvider = global.SixCRM.routes.include('controllers', 'providers/iam-provider.js');
			const iamprovider = new IAMProvider();

			iamprovider.iam = {
				addRoleToInstanceProfile: AWSTestUtils.AWSPromise('any_role_data')
			};

			return iamprovider.addRoleToInstanceProfile(params).then((result) => {
				expect(result).to.equal('any_role_data');
			});
		});

		it('throws error from iam utilities add role to instance profile', () => {

			let params = 'any_params';

			const IAMProvider = global.SixCRM.routes.include('controllers', 'providers/iam-provider.js');
			const iamprovider = new IAMProvider();

			iamprovider.iam = {
				addRoleToInstanceProfile: AWSTestUtils.AWSError('fail')
			};

			return iamprovider.addRoleToInstanceProfile(params).catch((error) => {
				expect(error.message).to.equal('fail');
			});
		});
	});
});

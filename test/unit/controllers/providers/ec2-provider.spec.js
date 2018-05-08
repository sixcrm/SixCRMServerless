const chai = require('chai');
const expect = chai.expect;
const mockery = require('mockery');

describe('controllers/providers/ec2-provider', () => {

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

	xdescribe('describeSecurityGroups', () => {

		it('describe security groups', () => {
			const EC2Provider = global.SixCRM.routes.include('controllers', 'providers/ec2-provider.js');
			const ec2provider = new EC2Provider();

			ec2provider.ec2 = {
				describeSecurityGroups: function(params, callback) {
					callback(null, 'success')
				}
			};

			return ec2provider.describeSecurityGroups('any_params').then((result) => {
				expect(result).to.equal('success');
			});
		});

		it('throws error from ec2 describeSecurityGroups', () => {
			const EC2Provider = global.SixCRM.routes.include('controllers', 'providers/ec2-provider.js');
			const ec2provider = new EC2Provider();

			ec2provider.ec2 = {
				describeSecurityGroups: function(params, callback) {
					callback('fail', null)
				}
			};

			return ec2provider.describeSecurityGroups('any_params').catch((error) => {
				expect(error.message).to.equal('[500] fail');
			});
		});
	});

	describe('securityGroupExists', () => {

		xit('returns false when security group is not found', () => {

			//timestamp mocked to reduce test execution time
			mockery.registerMock(global.SixCRM.routes.path('lib', 'timestamp.js'), {
				delay: () => {
					return Promise.resolve();
				}
			});

			const EC2Provider = global.SixCRM.routes.include('controllers', 'providers/ec2-provider.js');
			const ec2provider = new EC2Provider();

			delete ec2provider.security_group_descriptions;

			ec2provider.ec2 = {
				describeSecurityGroups: function(params, callback) {
					callback(null, {SecurityGroups: ['a_security_group_name']})
				}
			};

			return ec2provider.securityGroupExists('a_security_group', undefined, 2).then((result) => {
				expect(result).to.be.false;
			});
		});

		it('returns security group data when security group exists', () => {
			const EC2Provider = global.SixCRM.routes.include('controllers', 'providers/ec2-provider.js');
			const ec2provider = new EC2Provider();

			delete ec2provider.security_group_descriptions;

			ec2provider.ec2 = {
				describeSecurityGroups: function(params, callback) {
					callback(null, {SecurityGroups: [{GroupName: 'a_security_group_name'}]})
				}
			};

			return ec2provider.securityGroupExists('a_security_group_name', false).then((result) => {
				expect(result).to.deep.equal({GroupName: 'a_security_group_name'});
			});
		});
	});

	describe('determineGroupIDFromName', () => {

		xit('determines group id from name', () => {
			const EC2Provider = global.SixCRM.routes.include('controllers', 'providers/ec2-provider.js');
			const ec2provider = new EC2Provider();

			delete ec2provider.security_group_descriptions;

			ec2provider.ec2 = {
				describeSecurityGroups: function(params, callback) {
					callback(null, {SecurityGroups: [{GroupName: 'a_security_group_name', GroupId: 1}]})
				}
			};

			return ec2provider.determineGroupIDFromName('a_security_group_name').then((result) => {
				expect(result).to.equal(1);
			});
		});
	});

	describe('addSecurityGroupIngressRules', () => {

		it('throws error when group id and name are missing', async () => {

			const EC2Provider = global.SixCRM.routes.include('controllers', 'providers/ec2-provider.js');
			const ec2provider = new EC2Provider();

			try {
				await ec2provider.addSecurityGroupIngressRules('a_security_group_name');
			}
			catch (error) {
				expect(error.code).to.equal(500);
			}

		});

		it('adds security group ingress rules', () => {

			const EC2Provider = global.SixCRM.routes.include('controllers', 'providers/ec2-provider.js');
			const ec2provider = new EC2Provider();

			delete ec2provider.security_group_descriptions;

			ec2provider.ec2 = {
				describeSecurityGroups: function(params, callback) {
					callback(null, {SecurityGroups: [{GroupName: 'a_security_group_name', GroupId: 1}]})
				},
				authorizeSecurityGroupIngress: function(params, callback) {
					callback(null, 'success')
				}
			};

			return ec2provider.addSecurityGroupIngressRules({GroupName:'a_security_group_name'}).then((result) => {
				expect(result).to.equal('success');
			});
		});
	});

	xdescribe('addSecurityGroupEgressRules', () => {

		it('throws error when group id and name are missing', () => {

			const EC2Provider = global.SixCRM.routes.include('controllers', 'providers/ec2-provider.js');
			const ec2provider = new EC2Provider();

			try {
				ec2provider.addSecurityGroupEgressRules('a_security_group_name')
			}catch(error){
				expect(error.message).to.equal('[500] Inappropriate Parameterization');
			}
		});

		it('adds security group egress rules', () => {

			const EC2Provider = global.SixCRM.routes.include('controllers', 'providers/ec2-provider.js');
			const ec2provider = new EC2Provider();

			delete ec2provider.security_group_descriptions;

			ec2provider.ec2 = {
				describeSecurityGroups: function(params, callback) {
					callback(null, {SecurityGroups: [{GroupName: 'a_security_group_name', GroupId: 1}]})
				},
				authorizeSecurityGroupEgress: function(params, callback) {
					callback(null, 'success')
				}
			};

			return ec2provider.addSecurityGroupEgressRules({GroupName:'a_security_group_name'}).then((result) => {
				expect(result).to.equal('success');
			});
		});
	});

	describe('assureSecurityGroup', () => {

		it('throws error when group id and name are undefined', async () => {
			const EC2Provider = global.SixCRM.routes.include('controllers', 'providers/ec2-provider.js');
			const ec2provider = new EC2Provider();

			try {
				await ec2provider.assureSecurityGroup('any_params');
			}catch(error){
				expect(error.code).to.equal(500);
			}
		});

		it('returns security group data', () => {

			let response = {SecurityGroups: [{GroupName: 'a_security_group_name', GroupId: 1}]};

			const EC2Provider = global.SixCRM.routes.include('controllers', 'providers/ec2-provider.js');
			const ec2provider = new EC2Provider();

			delete ec2provider.security_group_descriptions;

			ec2provider.ec2 = {
				describeSecurityGroups: function(params, callback) {
					callback(null, response)
				}
			};

			return ec2provider.assureSecurityGroup({GroupName: 'a_security_group_name'}).then((result) => {
				expect(result).to.equal(response.SecurityGroups[0]);
			});
		});
	});

	describe('revokeSecurityGroupIngress', () => {

		it('revokes security group ingress', () => {
			const EC2Provider = global.SixCRM.routes.include('controllers', 'providers/ec2-provider.js');
			const ec2provider = new EC2Provider();

			ec2provider.ec2 = {
				revokeSecurityGroupIngress: function(params, callback) {
					callback(null, 'success')
				}
			};

			return ec2provider.revokeSecurityGroupIngress('any_params').then((result) => {
				expect(result).to.equal('success');
			});
		});

		it('throws error from ec2 revokeSecurityGroupIngress', () => {
			const EC2Provider = global.SixCRM.routes.include('controllers', 'providers/ec2-provider.js');
			const ec2provider = new EC2Provider();

			ec2provider.ec2 = {
				revokeSecurityGroupIngress: function(params, callback) {
					callback('fail', null)
				}
			};

			return ec2provider.revokeSecurityGroupIngress('any_params').catch((error) => {
				expect(error.message).to.equal('[500] fail');
			});
		});
	});

	describe('removeExistingIngressRules', () => {

		it('successfully revoked ingress rules', () => {

			let response = {SecurityGroups: [{GroupName: 'a_security_group_name', GroupId: 1, IpPermissions: ['a_permission']}]};

			const EC2Provider = global.SixCRM.routes.include('controllers', 'providers/ec2-provider.js');
			const ec2provider = new EC2Provider();

			delete ec2provider.security_group_descriptions;

			ec2provider.ec2 = {
				revokeSecurityGroupIngress: function(params, callback) {
					callback(null, 'success')
				},
				describeSecurityGroups: function(params, callback) {
					callback(null, response)
				}
			};

			return ec2provider.removeExistingIngressRules({GroupId: 1}).then((result) => {
				expect(result).to.equal('success');
			});
		});

		it('returns false when there are no ingress rules to revoke', () => {

			let response = {SecurityGroups: [{GroupName: 'a_security_group_name', GroupId: 1}]};

			const EC2Provider = global.SixCRM.routes.include('controllers', 'providers/ec2-provider.js');
			const ec2provider = new EC2Provider();

			delete ec2provider.security_group_descriptions;

			ec2provider.ec2 = {
				describeSecurityGroups: function(params, callback) {
					callback(null, response)
				}
			};

			return ec2provider.removeExistingIngressRules({GroupId: 1}).then((result) => {
				expect(result).to.be.false;
			});
		});
	});

	describe('removeExistingEgressRules', () => {

		it('successfully revoked egress rules', () => {

			let response = {SecurityGroups: [{GroupName: 'a_security_group_name', GroupId: 1, IpPermissionsEgress: ['a_permission']}]};

			const EC2Provider = global.SixCRM.routes.include('controllers', 'providers/ec2-provider.js');
			const ec2provider = new EC2Provider();

			delete ec2provider.security_group_descriptions;

			ec2provider.ec2 = {
				revokeSecurityGroupEgress: function(params, callback) {
					callback(null, 'success')
				},
				describeSecurityGroups: function(params, callback) {
					callback(null, response)
				}
			};

			return ec2provider.removeExistingEgressRules({GroupId: 1}).then((result) => {
				expect(result).to.equal('success');
			});
		});

		it('returns false when there are no egress rules to revoke', () => {

			let response = {SecurityGroups: [{GroupName: 'a_security_group_name', GroupId: 1}]};

			const EC2Provider = global.SixCRM.routes.include('controllers', 'providers/ec2-provider.js');
			const ec2provider = new EC2Provider();

			delete ec2provider.security_group_descriptions;

			ec2provider.ec2 = {
				describeSecurityGroups: function(params, callback) {
					callback(null, response)
				}
			};

			return ec2provider.removeExistingEgressRules({GroupId: 1}).then((result) => {
				expect(result).to.be.false;
			});
		});
	});

	describe('revokeSecurityGroupEgress', () => {

		it('revokes security group egress', () => {
			const EC2Provider = global.SixCRM.routes.include('controllers', 'providers/ec2-provider.js');
			const ec2provider = new EC2Provider();

			ec2provider.ec2 = {
				revokeSecurityGroupEgress: function(params, callback) {
					callback(null, 'success')
				}
			};

			return ec2provider.revokeSecurityGroupEgress('any_params').then((result) => {
				expect(result).to.equal('success');
			});
		});

		it('throws error from ec2 revokeSecurityGroupEgress', () => {
			const EC2Provider = global.SixCRM.routes.include('controllers', 'providers/ec2-provider.js');
			const ec2provider = new EC2Provider();

			ec2provider.ec2 = {
				revokeSecurityGroupEgress: function(params, callback) {
					callback('fail', null)
				}
			};

			return ec2provider.revokeSecurityGroupEgress('any_params').catch((error) => {
				expect(error.message).to.equal('[500] fail');
			});
		});
	});

	describe('filterRule', () => {

		it('returns filtered rule', () => {

			//rule with a valid structure
			let a_rule = {IpProtocol: 'tcp', IpRanges: [], UserIdGroupPairs: []};

			const EC2Provider = global.SixCRM.routes.include('controllers', 'providers/ec2-provider.js');
			const ec2provider = new EC2Provider();

			expect(ec2provider.filterRule(a_rule)).to.deep.equal({IpProtocol: 'tcp'});
		});

		it('returns filtered rule', () => {

			//rule with a valid structure and sample data for IpRanges and UserIdGroupPairs
			let a_rule = {IpProtocol: '-1', IpRanges: ['an_ip_range'], UserIdGroupPairs: ['a_user_id_group_pairs']};

			const EC2Provider = global.SixCRM.routes.include('controllers', 'providers/ec2-provider.js');
			const ec2provider = new EC2Provider();

			expect(ec2provider.filterRule(a_rule)).to.deep.equal(a_rule);
		});
	});

	xdescribe('getSecurityGroupIdentifier', () => {

		it('returns filtered rule', () => {

			const EC2Provider = global.SixCRM.routes.include('controllers', 'providers/ec2-provider.js');
			const ec2provider = new EC2Provider();

			expect(ec2provider.getSecurityGroupIdentifier({GroupId: 1})).to.equal(1);
		});

		it('returns filtered rule', () => {

			const EC2Provider = global.SixCRM.routes.include('controllers', 'providers/ec2-provider.js');
			const ec2provider = new EC2Provider();

			expect(ec2provider.getSecurityGroupIdentifier({GroupName: 'a_group_name'})).to.equal('a_group_name');
		});
	});

	xdescribe('createSecurityGroup', () => {

		it('create security groups', () => {
			const EC2Provider = global.SixCRM.routes.include('controllers', 'providers/ec2-provider.js');
			const ec2provider = new EC2Provider();

			ec2provider.ec2 = {
				createSecurityGroup: () => {
					return {
						on: (parameters, response) => {
							response('success');
						},
						send: () => {}
					}
				}
			};

			return ec2provider.createSecurityGroup('any_params').then((result) => {
				expect(result).to.equal('success');
			});
		});

		it('throws error when security group is not created', () => {
			const EC2Provider = global.SixCRM.routes.include('controllers', 'providers/ec2-provider.js');
			const ec2provider = new EC2Provider();

			ec2provider.ec2 = {
				createSecurityGroup: () => {
					return {
						on: () => {
							return {
								on: (parameters, response) => {
									response('error');
								}
							}
						},
						send: () => {}
					}
				}
			};

			return ec2provider.createSecurityGroup('any_params').catch((error) => {
				expect(error.message).to.equal('[500] error');
			});
		});
	});

	describe('destroySecurityGroup', () => {

		it('destroys security group if that group exists', () => {
			const EC2Provider = global.SixCRM.routes.include('controllers', 'providers/ec2-provider.js');
			const ec2provider = new EC2Provider();

			let functions = {};

			ec2provider.ec2 = {
				describeSecurityGroups: function(params, callback) {
					callback(null, {SecurityGroups: [{GroupName: 'any_group_name'}]})
				},
				deleteSecurityGroup: () => {
					return {
						on: (event_name, fn) => {
							functions[event_name] = fn;

							return {
								on: (event_name, fn) => {
									functions[event_name] = fn;
								}
							}
						},
						send: () => {
							return functions['success']('Execution result');
						}
					}
				}
			};

			return ec2provider.destroySecurityGroup({GroupName: 'any_group_name'}).then((result) => {
				expect(result).to.equal('Execution result');
			});
		});

		it('throws server error when security group is not destroyed', () => {
			const EC2Provider = global.SixCRM.routes.include('controllers', 'providers/ec2-provider.js');
			const ec2provider = new EC2Provider();

			let functions = {};

			ec2provider.ec2 = {
				describeSecurityGroups: function(params, callback) {
					callback(null, {SecurityGroups: [{GroupName: 'any_group_name'}]})
				},
				deleteSecurityGroup: () => {
					return {
						on: (event_name, fn) => {
							functions[event_name] = fn;

							return {
								on: (event_name, fn) => {
									functions[event_name] = fn;
								}
							}
						},
						send: () => {
							return functions['error']('Execution error');
						}
					}
				}
			};

			return ec2provider.destroySecurityGroup({GroupName: 'any_group_name'}).catch((error) => {
				expect(error.message).to.equal('[500] Execution error');
			});
		});
	});
});

const chai = require('chai');
const expect = chai.expect;

describe('lib/ec2-utilities', () => {

    describe('describeSecurityGroups', () => {

        it('describe security groups', () => {
            const EC2Utilities = global.SixCRM.routes.include('lib', 'ec2-utilities.js');
            const ec2utilities = new EC2Utilities();

            ec2utilities.ec2 = {
                describeSecurityGroups: function(params, callback) {
                    callback(null, 'success')
                }
            };

            return ec2utilities.describeSecurityGroups('any_params').then((result) => {
                expect(result).to.equal('success');
            });
        });

        it('throws error from ec2 describeSecurityGroups', () => {
            const EC2Utilities = global.SixCRM.routes.include('lib', 'ec2-utilities.js');
            const ec2utilities = new EC2Utilities();

            ec2utilities.ec2 = {
                describeSecurityGroups: function(params, callback) {
                    callback('fail', null)
                }
            };

            return ec2utilities.describeSecurityGroups('any_params').catch((error) => {
                expect(error.message).to.equal('[500] fail');
            });
        });
    });

    describe('securityGroupExists', () => {

        it('returns false when security group is not found', () => {
            const EC2Utilities = global.SixCRM.routes.include('lib', 'ec2-utilities.js');
            const ec2utilities = new EC2Utilities();

            delete ec2utilities.security_group_descriptions;

            ec2utilities.ec2 = {
                describeSecurityGroups: function(params, callback) {
                    callback(null, {SecurityGroups: ['a_security_group_name']})
                }
            };

            return ec2utilities.securityGroupExists('a_security_group', undefined, 2).then((result) => {
                expect(result).to.be.false;
            });
        });

        it('returns security group data when security group exists', () => {
            const EC2Utilities = global.SixCRM.routes.include('lib', 'ec2-utilities.js');
            const ec2utilities = new EC2Utilities();

            delete ec2utilities.security_group_descriptions;

            ec2utilities.ec2 = {
                describeSecurityGroups: function(params, callback) {
                    callback(null, {SecurityGroups: [{GroupName: 'a_security_group_name'}]})
                }
            };

            return ec2utilities.securityGroupExists('a_security_group_name', false).then((result) => {
                expect(result).to.deep.equal({GroupName: 'a_security_group_name'});
            });
        });
    });

    describe('determineGroupIDFromName', () => {

        it('determines group id from name', () => {
            const EC2Utilities = global.SixCRM.routes.include('lib', 'ec2-utilities.js');
            const ec2utilities = new EC2Utilities();

            delete ec2utilities.security_group_descriptions;

            ec2utilities.ec2 = {
                describeSecurityGroups: function(params, callback) {
                    callback(null, {SecurityGroups: [{GroupName: 'a_security_group_name', GroupId: 1}]})
                }
            };

            return ec2utilities.determineGroupIDFromName('a_security_group_name').then((result) => {
                expect(result).to.equal(1);
            });
        });
    });

    describe('addSecurityGroupIngressRules', () => {

        it('throws error when group id and name are missing', () => {

            const EC2Utilities = global.SixCRM.routes.include('lib', 'ec2-utilities.js');
            const ec2utilities = new EC2Utilities();

            try {
                ec2utilities.addSecurityGroupIngressRules('a_security_group_name')
            }catch(error){
                expect(error.message).to.equal('[500] Inappropriate Parameterization');
            }
        });

        it('adds security group ingress rules', () => {

            const EC2Utilities = global.SixCRM.routes.include('lib', 'ec2-utilities.js');
            const ec2utilities = new EC2Utilities();

            delete ec2utilities.security_group_descriptions;

            ec2utilities.ec2 = {
                describeSecurityGroups: function(params, callback) {
                    callback(null, {SecurityGroups: [{GroupName: 'a_security_group_name', GroupId: 1}]})
                },
                authorizeSecurityGroupIngress: function(params, callback) {
                    callback(null, 'success')
                }
            };

            return ec2utilities.addSecurityGroupIngressRules({GroupName:'a_security_group_name'}).then((result) => {
                expect(result).to.equal('success');
            });
        });
    });

    describe('addSecurityGroupEgressRules', () => {

        it('throws error when group id and name are missing', () => {

            const EC2Utilities = global.SixCRM.routes.include('lib', 'ec2-utilities.js');
            const ec2utilities = new EC2Utilities();

            try {
                ec2utilities.addSecurityGroupEgressRules('a_security_group_name')
            }catch(error){
                expect(error.message).to.equal('[500] Inappropriate Parameterization');
            }
        });

        it('adds security group egress rules', () => {

            const EC2Utilities = global.SixCRM.routes.include('lib', 'ec2-utilities.js');
            const ec2utilities = new EC2Utilities();

            delete ec2utilities.security_group_descriptions;

            ec2utilities.ec2 = {
                describeSecurityGroups: function(params, callback) {
                    callback(null, {SecurityGroups: [{GroupName: 'a_security_group_name', GroupId: 1}]})
                },
                authorizeSecurityGroupEgress: function(params, callback) {
                    callback(null, 'success')
                }
            };

            return ec2utilities.addSecurityGroupEgressRules({GroupName:'a_security_group_name'}).then((result) => {
                expect(result).to.equal('success');
            });
        });
    });

    describe('assureSecurityGroup', () => {

        it('throws error when group id and name are undefined', () => {
            const EC2Utilities = global.SixCRM.routes.include('lib', 'ec2-utilities.js');
            const ec2utilities = new EC2Utilities();

            try {
                ec2utilities.assureSecurityGroup('any_params')
            }catch(error){
                expect(error.message).to.equal('[500] EC2Utilities.assureSecurityGroup expects GroupName of GroupId arguments');
            }
        });

        it('returns security group data', () => {

            let response = {SecurityGroups: [{GroupName: 'a_security_group_name', GroupId: 1}]};

            const EC2Utilities = global.SixCRM.routes.include('lib', 'ec2-utilities.js');
            const ec2utilities = new EC2Utilities();

            delete ec2utilities.security_group_descriptions;

            ec2utilities.ec2 = {
                describeSecurityGroups: function(params, callback) {
                    callback(null, response)
                }
            };

            return ec2utilities.assureSecurityGroup({GroupName: 'a_security_group_name'}).then((result) => {
                expect(result).to.equal(response.SecurityGroups[0]);
            });
        });
    });

    describe('revokeSecurityGroupIngress', () => {

        it('revokes security group ingress', () => {
            const EC2Utilities = global.SixCRM.routes.include('lib', 'ec2-utilities.js');
            const ec2utilities = new EC2Utilities();

            ec2utilities.ec2 = {
                revokeSecurityGroupIngress: function(params, callback) {
                    callback(null, 'success')
                }
            };

            return ec2utilities.revokeSecurityGroupIngress('any_params').then((result) => {
                expect(result).to.equal('success');
            });
        });

        it('throws error from ec2 revokeSecurityGroupIngress', () => {
            const EC2Utilities = global.SixCRM.routes.include('lib', 'ec2-utilities.js');
            const ec2utilities = new EC2Utilities();

            ec2utilities.ec2 = {
                revokeSecurityGroupIngress: function(params, callback) {
                    callback('fail', null)
                }
            };

            return ec2utilities.revokeSecurityGroupIngress('any_params').catch((error) => {
                expect(error.message).to.equal('[500] fail');
            });
        });
    });

    describe('removeExistingIngressRules', () => {

        it('successfully revoked ingress rules', () => {

            let response = {SecurityGroups: [{GroupName: 'a_security_group_name', GroupId: 1, IpPermissions: ['a_permission']}]};

            const EC2Utilities = global.SixCRM.routes.include('lib', 'ec2-utilities.js');
            const ec2utilities = new EC2Utilities();

            delete ec2utilities.security_group_descriptions;

            ec2utilities.ec2 = {
                revokeSecurityGroupIngress: function(params, callback) {
                    callback(null, 'success')
                },
                describeSecurityGroups: function(params, callback) {
                    callback(null, response)
                }
            };

            return ec2utilities.removeExistingIngressRules({GroupId: 1}).then((result) => {
                expect(result).to.equal('success');
            });
        });

        it('returns false when there are no ingress rules to revoke', () => {

            let response = {SecurityGroups: [{GroupName: 'a_security_group_name', GroupId: 1}]};

            const EC2Utilities = global.SixCRM.routes.include('lib', 'ec2-utilities.js');
            const ec2utilities = new EC2Utilities();

            delete ec2utilities.security_group_descriptions;

            ec2utilities.ec2 = {
                describeSecurityGroups: function(params, callback) {
                    callback(null, response)
                }
            };

            return ec2utilities.removeExistingIngressRules({GroupId: 1}).then((result) => {
                expect(result).to.be.false;
            });
        });
    });

    describe('removeExistingEgressRules', () => {

        it('successfully revoked egress rules', () => {

            let response = {SecurityGroups: [{GroupName: 'a_security_group_name', GroupId: 1, IpPermissionsEgress: ['a_permission']}]};

            const EC2Utilities = global.SixCRM.routes.include('lib', 'ec2-utilities.js');
            const ec2utilities = new EC2Utilities();

            delete ec2utilities.security_group_descriptions;

            ec2utilities.ec2 = {
                revokeSecurityGroupEgress: function(params, callback) {
                    callback(null, 'success')
                },
                describeSecurityGroups: function(params, callback) {
                    callback(null, response)
                }
            };

            return ec2utilities.removeExistingEgressRules({GroupId: 1}).then((result) => {
                expect(result).to.equal('success');
            });
        });

        it('returns false when there are no egress rules to revoke', () => {

            let response = {SecurityGroups: [{GroupName: 'a_security_group_name', GroupId: 1}]};

            const EC2Utilities = global.SixCRM.routes.include('lib', 'ec2-utilities.js');
            const ec2utilities = new EC2Utilities();

            delete ec2utilities.security_group_descriptions;

            ec2utilities.ec2 = {
                describeSecurityGroups: function(params, callback) {
                    callback(null, response)
                }
            };

            return ec2utilities.removeExistingEgressRules({GroupId: 1}).then((result) => {
                expect(result).to.be.false;
            });
        });
    });

    describe('revokeSecurityGroupEgress', () => {

        it('revokes security group egress', () => {
            const EC2Utilities = global.SixCRM.routes.include('lib', 'ec2-utilities.js');
            const ec2utilities = new EC2Utilities();

            ec2utilities.ec2 = {
                revokeSecurityGroupEgress: function(params, callback) {
                    callback(null, 'success')
                }
            };

            return ec2utilities.revokeSecurityGroupEgress('any_params').then((result) => {
                expect(result).to.equal('success');
            });
        });

        it('throws error from ec2 revokeSecurityGroupEgress', () => {
            const EC2Utilities = global.SixCRM.routes.include('lib', 'ec2-utilities.js');
            const ec2utilities = new EC2Utilities();

            ec2utilities.ec2 = {
                revokeSecurityGroupEgress: function(params, callback) {
                    callback('fail', null)
                }
            };

            return ec2utilities.revokeSecurityGroupEgress('any_params').catch((error) => {
                expect(error.message).to.equal('[500] fail');
            });
        });
    });

    describe('filterRule', () => {

        it('returns filtered rule', () => {

            //rule with a valid structure
            let a_rule = {IpProtocol: 'tcp', IpRanges: [], UserIdGroupPairs: []};

            const EC2Utilities = global.SixCRM.routes.include('lib', 'ec2-utilities.js');
            const ec2utilities = new EC2Utilities();

            expect(ec2utilities.filterRule(a_rule)).to.deep.equal({IpProtocol: 'tcp'});
        });

        it('returns filtered rule', () => {

            //rule with a valid structure and sample data for IpRanges and UserIdGroupPairs
            let a_rule = {IpProtocol: '-1', IpRanges: ['an_ip_range'], UserIdGroupPairs: ['a_user_id_group_pairs']};

            const EC2Utilities = global.SixCRM.routes.include('lib', 'ec2-utilities.js');
            const ec2utilities = new EC2Utilities();

            expect(ec2utilities.filterRule(a_rule)).to.deep.equal(a_rule);
        });
    });

    describe('getSecurityGroupIdentifier', () => {

        it('returns filtered rule', () => {

            const EC2Utilities = global.SixCRM.routes.include('lib', 'ec2-utilities.js');
            const ec2utilities = new EC2Utilities();

            expect(ec2utilities.getSecurityGroupIdentifier({GroupId: 1})).to.equal(1);
        });

        it('returns filtered rule', () => {

            const EC2Utilities = global.SixCRM.routes.include('lib', 'ec2-utilities.js');
            const ec2utilities = new EC2Utilities();

            expect(ec2utilities.getSecurityGroupIdentifier({GroupName: 'a_group_name'})).to.equal('a_group_name');
        });
    });

    describe('createSecurityGroup', () => {

        it('create security groups', () => {
            const EC2Utilities = global.SixCRM.routes.include('lib', 'ec2-utilities.js');
            const ec2utilities = new EC2Utilities();

            ec2utilities.ec2 = {
                createSecurityGroup: () => {
                    return {
                        on: (parameters, response) => {
                            response('success');
                        },
                        send: () => {}
                    }
                }
            };

            return ec2utilities.createSecurityGroup('any_params').then((result) => {
                expect(result).to.equal('success');
            });
        });

        it('throws error when security group is not created', () => {
            const EC2Utilities = global.SixCRM.routes.include('lib', 'ec2-utilities.js');
            const ec2utilities = new EC2Utilities();

            ec2utilities.ec2 = {
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

            return ec2utilities.createSecurityGroup('any_params').catch((error) => {
                expect(error.message).to.equal('[500] error');
            });
        });
    });

    describe('destroySecurityGroup', () => {

        it('destroys security group if that group exists', () => {
            const EC2Utilities = global.SixCRM.routes.include('lib', 'ec2-utilities.js');
            const ec2utilities = new EC2Utilities();

            ec2utilities.ec2 = {
                describeSecurityGroups: function(params, callback) {
                    callback(null, {SecurityGroups: [{GroupName: 'any_group_name'}]})
                },
                deleteSecurityGroup: () => {
                    return {
                        on: (parameters, response) => {
                            response('success');
                        },
                        send: () => {}
                    }
                }
            };

            return ec2utilities.destroySecurityGroup({GroupName: 'any_group_name'}).then((result) => {
                expect(result).to.equal('success');
            });
        });
    });
});
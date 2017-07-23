'use strict';

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const EC2Utilities = global.SixCRM.routes.include('lib', 'ec2-utilities.js');
const AWSDeploymentUtilities = global.SixCRM.routes.include('deployment', 'utilities/aws-deployment-utilities.js');

module.exports = class EC2Deployment extends AWSDeploymentUtilities{

  constructor() {

    super();

    this.ec2utilities = new EC2Utilities();

    this.parameter_groups = {
      security_group: {
        create: {
          required:['Description', 'GroupName']
        },
        create_ingress_rules: {
          required:['GroupId'],
          optional:['GroupName','CidrIp','FromPort','ToPort','IpProtocol','SourceSecurityGroupName','SourceSecurityGroupOwnerId','IpPermissions']
        },
        create_egress_rules: {
          required:['GroupId'],
          optional:['GroupName','CidrIp','FromPort','ToPort','IpProtocol','SourceSecurityGroupName','SourceSecurityGroupOwnerId','IpPermissions']
        },
        delete: {
          required:['GroupName'],
          optional:['GroupId', 'DryRun']
        }
      }
    }
  }

  deploySecurityGroups() {

    du.debug('Deploy Security Groups');

    let security_groups = this.getConfigurationJSON('security_groups');

    let security_group_promises = security_groups.map(security_group => this.deploySecurityGroup(security_group));

    return Promise.all(security_group_promises).then(() => {

      return 'Complete';

    });

  }

  deploySecurityGroup(security_group_definition){

    du.debug('Deploy Security Group');

    let ingress_parameter_group = this.createIngressParameterGroup(security_group_definition);
    let egress_parameter_group = this.createEgressParameterGroup(security_group_definition);

    return this.ec2utilities.assureSecurityGroup(this.createParameterGroup('security_group', 'create', security_group_definition))
    .then(() => this.ec2utilities.addSecurityGroupIngressRules(ingress_parameter_group))
    .then((aws_response) => {
      du.highlight('Successfully added ingress rules');
      return aws_response;
    })
    .then(() => this.ec2utilities.addSecurityGroupEgressRules(egress_parameter_group))
    .then((aws_response) => {
      du.highlight('Successfully added egress rules');
      du.highlight('Security group deployed')
      return aws_response;
    });

  }

  createIngressParameterGroup(security_group_definition){

    du.debug('Create Ingress Parameter Group');

    let ingress = security_group_definition.Ingress;

    let copy = objectutilities.clone(security_group_definition);

    delete copy.Egress;

    delete copy.Ingress;

    copy = objectutilities.merge(copy, ingress);

    return this.createParameterGroup('security_group', 'create_ingress_rules', copy);

  }

  createEgressParameterGroup(security_group_definition){

    du.debug('Create Egress Parameter Group');

    let egress = security_group_definition.Egress;

    let copy = objectutilities.clone(security_group_definition);

    delete copy.Egress;

    delete copy.Ingress;

    copy = objectutilities.merge(copy, egress);

    return this.createParameterGroup('security_group', 'create_egress_rules', copy);

  }

  destroySecurityGroups(){

    du.debug('Destroy Security Groups');

    let security_groups = this.getConfigurationJSON('security_groups');

    let security_group_promises = security_groups.map(security_group => this.destroySecurityGroup(security_group));

    return Promise.all(security_group_promises).then(() => {

      return 'Complete';

    });

  }

  destroySecurityGroup(security_group_definition){

    du.debug('Destroy Security Group');

    let parameters = this.createDestroyParameterGroup(security_group_definition);

    return this.ec2utilities.destroySecurityGroup(parameters);

  }

  createDestroyParameterGroup(security_group_definition){

    du.debug('Create Destroy Parameter Group');

    return this.createParameterGroup('security_group', 'delete', security_group_definition);

  }

  getConfigurationJSON(filename){

    du.debug('Get Configuration JSON');

    //Technical Debt:  This needs to be expanded to support multiple definitions...
    return global.SixCRM.routes.include('deployment', 'ec2/configuration/'+filename+'.json');

  }

}

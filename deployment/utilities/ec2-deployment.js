const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const parserutilities = global.SixCRM.routes.include('lib', 'parser-utilities.js');
const EC2Provider = global.SixCRM.routes.include('controllers', 'providers/ec2-provider.js');
const AWSDeploymentUtilities = global.SixCRM.routes.include('deployment', 'utilities/aws-deployment-utilities.js');

module.exports = class EC2Deployment extends AWSDeploymentUtilities{

  constructor() {

    super();

    this.ec2provider = new EC2Provider();

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

  deployVPCs(){

    du.debug('Deploy VPCs');

    const vpcs = this.getConfigurationJSON('vpcs');

    let vpc_promises = arrayutilities.map(vpcs, (vpc_definition) => {

      return () => this.deployVPC(vpc_definition);

    });

    return arrayutilities.serial(vpc_promises).then(() => { return 'Complete'; });

  }

  deployVPC(vpc_definition){

    du.debug('Deploy VPC');

    //Technical Debt:  If default changes, need to account for that here...
    //Note:  There are lots of things that get associated with VPCs that aren't accounted for here...
      //NetworkACLs
      //DHCP Options
      //Route Tables

    return this.VPCExists(vpc_definition).then(result => {
      if(_.isNull(result)){
        du.highlight('VPC does not exist: '+vpc_definition.Name);
        return this.createVPC(vpc_definition);
      }

      du.highlight('VPC exists: '+vpc_definition.Name);
      return true;

    })

  }

  createVPC(vpc_definition){

    du.debug('Create VPC');

    return Promise.resolve()
    .then(() => {

      if(_.has(vpc_definition, 'Default') && vpc_definition.Default === true){
        return this.ec2provider.createDefaultVpc();
      }

      return this.ec2provider.createVpc(vpc_definition);

    }).then(result => {

      return this.nameEC2Resource(result.Vpc.VpcId, vpc_definition.Name).then(() => {
        du.highlight('VPC Created: '+vpc_definition.Name);
        return result;
      });

    });

  }

  VPCExists(vpc_definition){

    du.debug('VPCExists');

    const argumentation = {
      Filters:[{
        Name: 'tag:Name',
        Values:[vpc_definition.Name]
      }]
    };

    return this.ec2provider.describeVpcs(argumentation).then(result => {

      if(_.has(result, 'Vpcs') && _.isArray(result.Vpcs)){
        if(arrayutilities.nonEmpty(result.Vpcs)){
          if(result.Vpcs.length == 1){
            return result.Vpcs[0];
          }
          eu.throwError('server','Multiple results returned: ', result);
        }
        return null;
      }

      eu.throwError('server', 'Unexpected result', result);

    });

  }

  deployInternetGateways(){

    du.debug('Deploy Internet Gateways');

    const internet_gateways = this.getConfigurationJSON('internet_gateways');

    let ig_promises = arrayutilities.map(internet_gateways, (ig) => {

      return () => this.deployInternetGateway(ig);

    });

    return arrayutilities.serial(ig_promises).then(() => { return 'Complete'; });

  }

  deployInternetGateway(ig_definition){

    du.debug('Deploy Internet Gateway');

    return this.gatewayExists(ig_definition).then(result => {

      if(_.isNull(result)){
        du.highlight('Internet Gateway does not exist: '+ig_definition.Name);
        return this.createInternetGateway(ig_definition);
      }

      du.highlight('Internet Gateway exists: '+ig_definition.Name);
      return result;

    });

  }

  createInternetGateway(ig_definition){

    du.debug('Create Internet Gateway');

    return this.ec2provider.createInternetGateway().then(result => {
      return this.nameEC2Resource(result.InternetGateway.InternetGatewayId, ig_definition.Name).then(() => {
        du.highlight('Internet Gateway Created: '+ig_definition.name);
        return result;
      });
    });

  }

  gatewayExists(ig_definition){

    du.debug('Gateway Exists');

    const argumentation = {
      Filters:[{
        Name: 'tag:Name',
        Values:[ig_definition.Name]
      }]
    };

    return this.ec2provider.describeInternetGateways(argumentation).then(result => {
      if(_.has(result, 'InternetGateways') && _.isArray(result.InternetGateways)){
        if(arrayutilities.nonEmpty(result.InternetGateways)){
          if(result.InternetGateways.length == 1){
            return result.InternetGateways[0];
          }
          eu.throwError('server', 'More than one result returned: ', result);
        }
        return null;
      }
      eu.throwError('server', 'Unexpected results: ', result);
    });

  }

  deployRouteTables(){

    du.debug('Deploy Route Tables');

    const route_tables = this.getConfigurationJSON('route_tables');

    return this.setVPC().then(() => {

      let route_table_promises = arrayutilities.map(route_tables, (route_table) => {

        return () => this.deployRouteTable(route_table);

      });

      return arrayutilities.serial(route_table_promises).then(() => { return 'Complete'; });

    });

  }

  deployRouteTable(route_table_definition){

    du.debug('Deploy Route Table');

    return this.routeTableExists(route_table_definition).then((result) => {

      if(_.isNull(result)){
        du.highlight('Route Table does not exist: '+route_table_definition.Name);
        return this.createRouteTable(route_table_definition);
      }

      du.highlight('Route Table exists: '+route_table_definition.Name);
      return result;

    }).then(route_table => {

      if(_.has(route_table_definition, 'AssociatedSubnets')){

        let subnet_promises = arrayutilities.map(route_table_definition.AssociatedSubnets, (subnet_association) => {
          return this.subnetExists(subnet_association);
        });

        return Promise.all(subnet_promises).then(subnets => {

          let subnet_associations = arrayutilities.map(subnets, subnet => {

            if(_.has(subnet, 'SubnetId')){
              let argumentation = {RouteTableId: route_table.RouteTableId, SubnetId: subnet.SubnetId};
              return () => this.ec2provider.associateRouteTable(argumentation);
            }

            du.warning('Unknown subnet structure: ', subnet);
            return () => Promise.resolve(null);

          });

          return arrayutilities.serial(subnet_associations);

        }).then(() => {
          return route_table;
        });

      }

      return route_table;

    }).then(route_table => {

      if(_.has(route_table_definition, 'Routes') && _.isArray(route_table_definition.Routes)){

        let route_promises = arrayutilities.map(route_table_definition.Routes, route_definition => {
          return () => this.deployRoute(route_table, route_definition);
        });

        return arrayutilities.serial(route_promises);

      }

    }).then(() => {

      du.highlight('Route table deployed: '+route_table_definition.Name);
      return true;

    });

  }

  deployRoute(route_table, route_definition){

    du.debug('Deploy Route');

    //Technical Debt:  Need to enable other named properties to be hydrated here...
    let associated_id_promises = [
      this.NATExists({Name: route_definition.NatGatewayName})
    ]

    return Promise.all(associated_id_promises).then(([nat]) => {

      const argumentation = objectutilities.merge(route_definition,  {
        RouteTableId: route_table.RouteTableId,
        NatGatewayId: nat.NatGatewayId,
      });

      return this.ec2provider.createRoute(argumentation).then(()=> {
        du.highlight('Route created.');
        return true;
      }).catch((error) => {
        if(error.code == 'RouteAlreadyExists'){
          return this.ec2provider.replaceRoute(argumentation).then(()=> {
            du.highlight('Route replaced.');
            return true;
          })
        }
        throw error;
      })

    });
  }

  createRouteTable(route_table_definition){

    du.debug('Create Route Table');

    let argumentation = {
      VpcId: this.vpc.VpcId
    };

    return this.ec2provider.createRouteTable(argumentation).then(result => {

      if(!objectutilities.hasRecursive(result, 'RouteTable.RouteTableId')){
        eu.throwError('server', 'Unexpected result: ', result);
      }

      return this.nameEC2Resource(result.RouteTable.RouteTableId, route_table_definition.Name).then(() => {
        return result;
      });

    });

  }

  routeTableExists(route_table_definition){

    du.debug('Route Table Exists');

    const argumentation = {
      Filters:[{
        Name: 'tag:Name',
        Values: [route_table_definition.Name]
      }]
    };

    return this.ec2provider.describeRouteTables(argumentation).then(result => {

      if(_.has(result, 'RouteTables') && _.isArray(result.RouteTables)){

        if(arrayutilities.nonEmpty(result.RouteTables)){

          if(result.RouteTables.length == 1){
            return result.RouteTables[0];
          }

          eu.throwError('server', 'More than one result returned: ', result);

        }

        return null;

      }

      eu.throwError('server', 'Unexpected result: ', result);

    });

  }

  deployNATs(){

    du.debug('Deploy NATs');

    const nats = this.getConfigurationJSON('nats');

    let nat_promises = arrayutilities.map(nats, (nat) => {

      return () => this.deployNAT(nat);

    });

    return arrayutilities.serial(nat_promises).then(() => { return 'Complete'; });

  }

  deployNAT(nat_definition){

    du.debug('Deploy NAT');

    return this.NATExists(nat_definition).then(result => {
      if(_.isNull(result)){
        du.highlight('NAT does not exist: '+nat_definition.Name);
        return this.createNAT(nat_definition);
      }

      du.highlight('NAT exists: '+nat_definition.Name);
      return true;

    });

  }

  createNAT(nat_definition){

    du.debug('Create NAT');

    let associated_properties_promises = [
      this.EIPExists({Name: nat_definition.AllocationName}),
      this.subnetExists({Name: nat_definition.SubnetName})
    ];

    return Promise.all(associated_properties_promises).then(([eip, subnet]) => {

      if(_.isNull(eip)){
        eu.throwError('server', 'EIP does not exist: '+nat_definition.AllocationName);
      }

      if(_.isNull(subnet)){
        eu.throwError('server', 'Subnet does not exist: '+nat_definition.SubnetName);
      }

      let argumentation = {
        AllocationId: eip.AllocationId,
        SubnetId: subnet.SubnetId
      };

      return this.ec2provider.createNatGateway(argumentation).then(result => {

        if(!objectutilities.hasRecursive(result, 'NatGateway.NatGatewayId')){
          eu.throwError('server', 'Unexpected result: ', result);
        }

        return this.nameEC2Resource(result.NatGateway.NatGatewayId, nat_definition.Name);

      });

    });

  }

  NATExists(nat_definition){

    du.debug('NAT Exists');

    let argumentation = {
      Filter: [
        {
          Name: "tag:Name",
          Values: [
             nat_definition.Name
          ]
        }
      ]
    }

    return this.ec2provider.describeNatGateways(argumentation).then(result => {

      if(_.has(result, 'NatGateways') && _.isArray(result.NatGateways)){

        if(arrayutilities.nonEmpty(result.NatGateways)){
          if(result.NatGateways.length == 1){
            return result.NatGateways[0];
          }

          eu.throwError('server', 'More than one NAT Gateway returned: ', result);

        }

        return null;

      }

      eu.throwError('server', 'Unexpected results: ', result);

    });

  }

  deployEIPs(){

    du.debug('Deploy EIPs');

    const eips = this.getConfigurationJSON('eips');

    let eip_promises = arrayutilities.map(eips, (eip) => {

      return () => this.deployEIP(eip);

    });

    return arrayutilities.serial(eip_promises).then(() => { return 'Complete'; });

  }

  deployEIP(eip_definition){

    du.debug('Deploy EIP');

    return this.EIPExists(eip_definition).then(result => {

      if(_.isNull(result)){
        du.highlight('EIP does not exist: '+eip_definition.Name);
        return this.createEIP(eip_definition).then(() => {
          du.highlight('EIP Allocated.');
        });
      }

      du.highlight('EIP exists');
      return true;

    });

  }

  createEIP(eip_definition){

    du.debug('Create EIP');

    return this.ec2provider.allocateAddress().then((result) => {

      if(objectutilities.hasRecursive(result, 'AllocationId')){
        return this.nameEC2Resource(result.AllocationId, eip_definition.Name);
      }

      eu.throwError('server', 'Unexpected Response: ', result);

    });

  }

  EIPExists(eip_definition){

    du.debug('EIP Exists');

    let argumentation = {
      Filters: [
        {
          Name: "domain",
          Values: ["vpc"]
        },
        {
          Name:'tag:Name',
          Values: [eip_definition.Name]
        }
      ]
    };

    return this.ec2provider.describeAddresses(argumentation).then(result => {

      if(_.has(result, 'Addresses') && _.isArray(result.Addresses)){

        if(arrayutilities.nonEmpty(result.Addresses)){

          if(result.Addresses.length == 1){
            return result.Addresses[0];
          }

          eu.throwError('server', 'More than one address was returned: ', result.Addresses);

        }

        return null;

      }

      eu.throwError('server', 'Unexpected results:', result);

    });

  }

  deploySubnets(){

    du.debug('Deploy Subnets');

    const subnets = this.getConfigurationJSON('subnets');

    return this.setVPC().then(() => {

      let subnet_promises = arrayutilities.map(subnets, (subnet) => {

        return () => this.deploySubnet(subnet);

      });

      return arrayutilities.serial(subnet_promises).then(() => { return 'Complete'; });

    });

  }

  setVPC(){

    du.debug('Set VPC');

    //Technical Debt:  Enable deploying to non-default VPCs
    //const deployment_vpc = this.getConfigurationJSON('vpcs');

    let argumentation = {
      Filters:[
        {
          Name: 'isDefault',
          Values:['true']
        }
      ]
    };

    /*
    if(_.has(deployment_vpc, 'ID')){

      argumentation = {
        Filters:[
          {
            Name: 'vpc-id',
            Values:[deployment_vpc.ID]
          }
        ]
      };

    }
    */

    return this.ec2provider.describeVPCs(argumentation).then(result => {

      if(_.has(result, 'Vpcs') && _.isArray(result.Vpcs)){

        if(arrayutilities.nonEmpty(result.Vpcs)){

          if(result.Vpcs.length == 1){
            this.vpc = result.Vpcs[0];
            return this.vpc;
          }

          eu.throwError('server', 'More than one VPC returned: '+result.Vpcs);

        }

        eu.throwError('server', 'Unable to identify VPC');

      }

      eu.throwError('server', 'Unable to describe VPCs: ', result);

    });

  }

  deploySubnet(subnet_definition){

    du.debug('Deploy Subnet');

    return this.subnetExists(subnet_definition).then(subnet => {

      if(_.isNull(subnet)){
        du.highlight('Subnet does not exist: '+subnet_definition.Name);
        return this.createSubnet(subnet_definition);
      }

      du.highlight('Subnet exists: '+subnet_definition.Name);

      return this.updateSubnet(subnet, subnet_definition);

    });

  }

  subnetExists(subnet_definition){

    du.debug('Subnet Exists');

    let argumentation = {
      Filters: [{
        Name: 'tag:Name',
        Values:[subnet_definition.Name]
      }]
    };

    return this.ec2provider.describeSubnets(argumentation).then(result => {

      if(_.has(result,'Subnets') && _.isArray(result.Subnets)){

        if(arrayutilities.nonEmpty(result.Subnets)){

          if(result.Subnets.length == 1){
            return result.Subnets[0];
          }

          eu.throwError('Multiple subnets returned:', result);

        }

        return null;

      }

      eu.throwError('server', 'Unexpected response: ', result);

    });

  }

  createSubnet(subnet_definition){

    du.debug('Create Subnet');

    let vpc_cidr_array = this.vpc.CidrBlock.split('.');
    subnet_definition.CidrBlock = parserutilities.parse(subnet_definition.CidrBlock, {
      'vpc.cidr.1': vpc_cidr_array[0],
      'vpc.cidr.2': vpc_cidr_array[1],
    });

    subnet_definition.VpcId = this.vpc.VpcId;

    return this.ec2provider.createSubnet(subnet_definition).then((result) => {

      if(objectutilities.hasRecursive(result, 'Subnet.SubnetId')){
        return this.nameEC2Resource(result.Subnet.SubnetId, subnet_definition.Name);
      }

      eu.throwError('server', 'Unexpected Response: ', result);

    });

  }

  nameEC2Resource(resource_identifier, name){

    du.debug('Name EC2 Resource');

    let argumentation = {
      Resources: [
        resource_identifier
      ],
      Tags:[
        {
          Key: 'Name',
          Value: name
        }
      ]
    };

    return this.ec2provider.createTags(argumentation).then(() => {
      return true;
    });

  }

  updateSubnet(subnet, subnet_definition){

    du.debug('Update Subnet');

    du.info('This feature is currently not supported.');

    du.info(subnet, subnet_definition);

    return true;

  }

  deploySecurityGroups() {

    du.debug('Deploy Security Groups');

    let security_groups = this.getConfigurationJSON('security_groups');

    let security_group_promises = arrayutilities.map(security_groups, (security_group) => {

      return () => this.deploySecurityGroup(security_group);

    });

    return arrayutilities.serial(security_group_promises).then(() => { return 'Complete'; });

  }

  deploySecurityGroup(security_group_definition){

    du.debug('Deploy Security Group');

    let ingress_parameter_group = this.createIngressParameterGroup(security_group_definition);
    let egress_parameter_group = this.createEgressParameterGroup(security_group_definition);

    return this.ec2provider.assureSecurityGroup(this.createParameterGroup('security_group', 'create', security_group_definition))
    .then(() => {
      if(!_.isNull(ingress_parameter_group)){
        return this.ec2provider.addSecurityGroupIngressRules(ingress_parameter_group);
      }else{
        return Promise.resolve(null);
      }
    })
    .then((aws_response) => {
      if(!_.isNull(aws_response)){
        du.highlight('Successfully added ingress rules');
      }
      return aws_response;
    })
    .then(() => {
      if(!_.isNull(egress_parameter_group)){
        return this.ec2provider.addSecurityGroupEgressRules(egress_parameter_group);
      }else{
        return Promise.resolve(null);
      }
    })
    .then((aws_response) => {
      if(!_.isNull(aws_response)){
        du.highlight('Successfully added egress rules');
      }
      du.highlight('Security group deployed')
      return aws_response;
    });

  }

  createIngressParameterGroup(security_group_definition){

    du.debug('Create Ingress Parameter Group');

    if(_.has(security_group_definition, 'Ingress')){

      let ingress = security_group_definition.Ingress;

      let copy = objectutilities.clone(security_group_definition);

      delete copy.Egress;

      delete copy.Ingress;

      copy = objectutilities.merge(copy, ingress);

      return this.createParameterGroup('security_group', 'create_ingress_rules', copy);

    }

    return null;


  }

  createEgressParameterGroup(security_group_definition){

    du.debug('Create Egress Parameter Group');

    if(_.has(security_group_definition, 'Egress')){

      let egress = security_group_definition.Egress;

      let copy = objectutilities.clone(security_group_definition);

      delete copy.Egress;

      delete copy.Ingress;

      copy = objectutilities.merge(copy, egress);

      return this.createParameterGroup('security_group', 'create_egress_rules', copy);

    }else{

      return null;

    }

  }

  destroySecurityGroups(){

    du.debug('Destroy Security Groups');

    let security_groups = this.getConfigurationJSON('security_groups');

    let security_group_promises = arrayutilities.map(security_groups, (security_group) => this.destroySecurityGroup(security_group));

    return Promise.all(security_group_promises).then(() => {

      return 'Complete';

    });

  }

  destroySecurityGroup(security_group_definition){

    du.debug('Destroy Security Group');

    let parameters = this.createDestroyParameterGroup(security_group_definition);

    return this.ec2provider.destroySecurityGroup(parameters);

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

module.exports.getLambdaSubnets = () => {

  require('../../SixCRM.js');
  const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
  const EC2Deployment = global.SixCRM.routes.include('deployment', 'utilities/ec2-deployment.js');
  let ec2_deployment = new EC2Deployment();

  let subnet_promises = arrayutilities.map(global.SixCRM.configuration.site_config.lambda.subnets, subnet => {
    return ec2_deployment.subnetExists({Name: subnet});
  });

  return Promise.all(subnet_promises).then((subnets) => {
    return arrayutilities.map(subnets, subnet => {
      return subnet.SubnetId;
    });
  });

}

module.exports.getLambdaSecurityGroup = () => {

  require('../../SixCRM.js');

  const EC2Deployment = global.SixCRM.routes.include('deployment', 'utilities/ec2-deployment.js');
  let ec2_deployment = new EC2Deployment();

  return ec2_deployment.securityGroupExists({GroupName: global.SixCRM.configuration.site_config.lambda.security_group}).then(result => {
    return result.GroupId;
  });

}

module.exports.getCloudsearchSearchEndpoint = () => {

  require('../../SixCRM.js');

  const CloudsearchUtilities = global.SixCRM.routes.include('deployment', 'utilities/cloudsearch-deployment.js');
  let cloudsearchutilities = new CloudsearchUtilities(false);

  return cloudsearchutilities.domainExists({DomainName: global.SixCRM.configuration.site_config.cloudsearch.domainname}).then(result => {
    return result.DocService.Endpoint;
  });

}

module.exports.getAuroraClusterEndpoint = () => {

  require('../../SixCRM.js');

  const RDSUtilities = global.SixCRM.routes.include('deployment', 'utilities/rds-utilities.js');
  let rdsutilities = new RDSUtilities();

  return rdsutilities.clusterExists({DBClusterIdentifier: global.SixCRM.configuration.site_config.aurora.default_cluster_identifier}).then(result => {
    return result.Endpoint;
  });

}
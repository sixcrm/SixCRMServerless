module.exports.getLambdaSubnets = () => {

  require('../../SixCRM.js');
  const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
  const EC2Deployment = global.SixCRM.routes.include('deployment', 'utilities/ec2-deployment.js');
  let ec2_deployment = new EC2Deployment();

  let subnet_promises = [
    ec2_deployment.subnetExists({Name: 'sixcrm-subnet1'}),
    ec2_deployment.subnetExists({Name: 'sixcrm-subnet2'}),
    ec2_deployment.subnetExists({Name: 'sixcrm-subnet3'})
  ];

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

  return ec2_deployment.securityGroupExists({GroupName: 'public-lambda'}).then(result => {
    return result.GroupId;
  });

}

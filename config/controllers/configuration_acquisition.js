module.exports.getLambdaSubnets = () => {

	require('../../SixCRM.js');
	const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
	const EC2Deployment = global.SixCRM.routes.include('deployment', 'utilities/ec2-deployment.js');
	let ec2_deployment = new EC2Deployment();

	let subnet_promises = arrayutilities.map(global.SixCRM.configuration.site_config.lambda.subnets, subnet => {
		console.log(subnet);
		return ec2_deployment.subnetExists({
			Name: subnet
		});
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

	return ec2_deployment.securityGroupExists({
		GroupName: global.SixCRM.configuration.site_config.lambda.security_group
	}).then(result => {
		return result.GroupId;
	});

}

module.exports.getCloudsearchSearchEndpoint = () => {

	require('../../SixCRM.js');

	const ConfigurationUtilities = global.SixCRM.routes.include('core', 'ConfigurationUtilities.js');

	if ((new ConfigurationUtilities(global.SixCRM.routes)).isLocal()) {

		return Promise.resolve({
			DocService: {
				Endpoint: global.SixCRM.configuration.site_config.cloudsearch.domainendpoint
			}
		});

	}

	const CloudsearchUtilities = global.SixCRM.routes.include('deployment', 'utilities/cloudsearch-deployment.js');
	let cloudsearchutilities = new CloudsearchUtilities(false);

	return cloudsearchutilities.domainExists({
		DomainName: global.SixCRM.configuration.site_config.cloudsearch.domainname
	}).then(result => {
		return result.DocService.Endpoint;
	});

}

module.exports.getAuroraClusterEndpoint = () => {

	require('../../SixCRM.js');

	const ConfigurationUtilities = global.SixCRM.routes.include('core', 'ConfigurationUtilities.js');

	if ((new ConfigurationUtilities(global.SixCRM.routes)).isLocal()) {

		return Promise.resolve({
			Endpoint: global.SixCRM.configuration.site_config.dynamodb.endpoint
		});

	}

	const RDSUtilities = global.SixCRM.routes.include('deployment', 'utilities/rds-utilities.js');
	let rdsutilities = new RDSUtilities();

	return rdsutilities.clusterExists({
		DBClusterIdentifier: global.SixCRM.configuration.site_config.aurora.default_cluster_identifier
	}).then(result => {
		return result.Endpoint;
	});

}

module.exports.getElasticSearchEndpoint = () => {

	require('../../SixCRM.js');

	// probably need to add this to docker compose???
	const ConfigurationUtilities = global.SixCRM.routes.include('core', 'ConfigurationUtilities.js');

	if ((new ConfigurationUtilities(global.SixCRM.routes)).isLocal()) {

		return Promise.resolve({
			Endpoint: '????'
		});

	}

	const ElasticSearchUtilities = global.SixCRM.routes.include('deployment', 'utilities/elasticsearch-deployment.js');
	let elasticsearchutilities = new ElasticSearchUtilities();

	return elasticsearchutilities.domainExists({DomainName: global.SixCRM.configuration.site_config.elasticsearch.domain_name}).then(result => {
		return result.DomainStatus.Endpoint;
	});

}

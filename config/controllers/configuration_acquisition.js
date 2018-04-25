module.exports.getVPCConfiguration = () => {

	return {
		securityGroupIds:['sg-fccb87b5'],
		subnetIds:['sg-fccb87b5','sg-fccb87b5','subnet-439d7c6d']
	}

}

module.exports.getLambdaSubnets = () => {

	require('../../SixCRM.js');
	const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
	const EC2Deployment = global.SixCRM.routes.include('deployment', 'utilities/ec2-deployment.js');
	let ec2_deployment = new EC2Deployment();

	let subnet_promises = arrayutilities.map(global.SixCRM.configuration.site_config.lambda.subnets, subnet => {
		return ec2_deployment.subnetExists({
			Name: subnet
		});
	});

	return Promise.all(subnet_promises).then((subnets) => {
		let subnet_ids = arrayutilities.map(subnets, subnet => {
			return subnet.SubnetId;
		});
		console.log('VPC Subnets: '+subnet_ids); //eslint-disable-line no-console
		return subnet_ids;
	});

}

module.exports.getLambdaSecurityGroup = () => {

	require('../../SixCRM.js');

	const EC2Deployment = global.SixCRM.routes.include('deployment', 'utilities/ec2-deployment.js');
	let ec2_deployment = new EC2Deployment();

	return ec2_deployment.securityGroupExists({
		GroupName: global.SixCRM.configuration.site_config.lambda.security_group
	}).then(result => {
		console.log('Lambda Security Groups: '+[result.GroupId]); //eslint-disable-line no-console
		return [result.GroupId];
	});

}

module.exports.getCloudsearchSearchEndpoint = () => {

	require('../../SixCRM.js');

	const ConfigurationUtilities = global.SixCRM.routes.include('core', 'ConfigurationUtilities.js');

	if ((new ConfigurationUtilities(global.SixCRM.routes)).isLocal()) {

		return Promise.resolve(global.SixCRM.configuration.site_config.cloudsearch.domainendpoint);

	}

	const CloudsearchUtilities = global.SixCRM.routes.include('deployment', 'utilities/cloudsearch-deployment.js');
	let cloudsearchutilities = new CloudsearchUtilities(false);

	return cloudsearchutilities.domainExists({
		DomainName: global.SixCRM.configuration.site_config.cloudsearch.domainname
	}).then(result => {
		console.log('CloudSearch: '+result.DocService.Endpoint); //eslint-disable-line no-console
		return result.DocService.Endpoint;
	});

}

module.exports.getAuroraClusterEndpoint = () => {

	require('../../SixCRM.js');

	const ConfigurationUtilities = global.SixCRM.routes.include('core', 'ConfigurationUtilities.js');

	if((new ConfigurationUtilities(global.SixCRM.routes)).isLocal()) {

		return Promise.resolve(global.SixCRM.configuration.site_config.dynamodb.endpoint);

	}

	const RDSUtilities = global.SixCRM.routes.include('deployment', 'utilities/rds-utilities.js');
	let rdsutilities = new RDSUtilities();

	return rdsutilities.clusterExists({
		DBClusterIdentifier: global.SixCRM.configuration.site_config.aurora.default_cluster_identifier
	}).then((result) => {
		console.log('Aurora: '+result.Endpoint); //eslint-disable-line no-console
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
		console.log('ElasticSearch: '+result.DomainStatus.Endpoint); //eslint-disable-line no-console
		return result.DomainStatus.Endpoint;
	});

}

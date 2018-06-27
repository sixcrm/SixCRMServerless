require('@6crm/sixcrmcore');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;

module.exports.getVPCConfiguration = () => {

	return {
		securityGroupIds: ['sg-fccb87b5'],
		subnetIds: ['sg-fccb87b5', 'sg-fccb87b5', 'subnet-439d7c6d']
	}

}

module.exports.getLambdaSubnets = () => {

	require('@6crm/sixcrmcore');
	const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
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
		du.debug('VPC Subnets: ' + subnet_ids);
		return subnet_ids;
	});

}

module.exports.getLambdaSecurityGroup = () => {

	require('@6crm/sixcrmcore');

	const EC2Deployment = global.SixCRM.routes.include('deployment', 'utilities/ec2-deployment.js');
	let ec2_deployment = new EC2Deployment();

	return ec2_deployment.securityGroupExists({
		GroupName: global.SixCRM.configuration.site_config.lambda.security_group
	}).then(result => {
		du.debug('Lambda Security Groups: ' + [result.GroupId]);
		return [result.GroupId];
	});

}

module.exports.getCloudsearchSearchEndpoint = () => {

	require('@6crm/sixcrmcore');

	if (global.SixCRM.configuration.isLocal()) {

		return Promise.resolve(global.SixCRM.configuration.site_config.cloudsearch.domainendpoint);

	}

	const CloudsearchUtilities = global.SixCRM.routes.include('deployment', 'utilities/cloudsearch-deployment.js');
	let cloudsearchutilities = new CloudsearchUtilities(false);

	return cloudsearchutilities.domainExists({
		DomainName: global.SixCRM.configuration.site_config.cloudsearch.domainname
	}).then(result => {
		du.debug('CloudSearch: ' + result.DocService.Endpoint);
		return result.DocService.Endpoint;
	});

}

module.exports.getAuroraClusterEndpoint = (force) => {

	require('@6crm/sixcrmcore');

	if (global.SixCRM.configuration.isLocal()) {

		du.debug(`getAuroraClusterEndpoint: LOCAL = ${global.SixCRM.configuration.site_config.aurora.host}`);

		return Promise.resolve(global.SixCRM.configuration.site_config.aurora.host);

	}

	du.debug(`getAuroraClusterEndpoint: AURORA_PROXY = ${process.env.AURORA_PROXY} FORCE = ${force}`);

	// if its running on circle and creating the SSH tunnel we need the real endpoint,
	// otherwise it is hitting the tunnel
	if (process.env.AURORA_PROXY && !force) {

		du.debug(`getAuroraClusterEndpoint: POINTED AT PROXY`);

		return Promise.resolve('127.0.0.1');

	}

	const RDSUtilities = global.SixCRM.routes.include('deployment', 'utilities/rds-utilities.js');
	let rdsutilities = new RDSUtilities();

	return rdsutilities.clusterExists({
		DBClusterIdentifier: global.SixCRM.configuration.site_config.aurora.default_cluster_identifier
	}).then((result) => {
		du.debug('Aurora: ' + result.Endpoint);
		return result.Endpoint;
	});

}

module.exports.getElasticSearchEndpoint = () => {

	require('@6crm/sixcrmcore');

	// probably need to add this to docker compose???
	if (global.SixCRM.configuration.isLocal()) {

		return Promise.resolve({
			Endpoint: '????'
		});

	}

	const ElasticSearchUtilities = global.SixCRM.routes.include('deployment', 'utilities/elasticsearch-deployment.js');
	let elasticsearchutilities = new ElasticSearchUtilities();

	return elasticsearchutilities.domainExists({
		DomainName: global.SixCRM.configuration.site_config.elasticsearch.domain_name
	}).then(result => {
		du.debug('ElasticSearch: ' + result.DomainStatus.Endpoint);
		return result.DomainStatus.Endpoint;
	});

}

module.exports.getProxyEndpoint = async () => {

	require('@6crm/sixcrmcore');

	if (global.SixCRM.configuration.isLocal()) {

		return Promise.resolve('');

	}

	const EC2Deployment = global.SixCRM.routes.include('deployment', 'utilities/ec2-deployment.js');
	const ec2_deployment = new EC2Deployment();
	const proxy = await ec2_deployment.EIPExists({
		Name: 'sixcrm-public-ssh-gateway'
	});

	return proxy.PublicIp

}

module.exports.getElastiCacheEndpoint = async () => {

	require('@6crm/sixcrmcore');

	if (global.SixCRM.configuration.isLocal()) {
		return Promise.resolve(global.SixCRM.configuration.site_config.elasticache.endpoint);
	}

	const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
	const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
	const ElastiCacheUtilities = global.SixCRM.routes.include('deployment', 'utilities/elasticache-deployment.js');
	let elasticacheutilities = new ElastiCacheUtilities();

	const result = await elasticacheutilities.clusterExists({
		CacheClusterId: 'sixcrm',
		ShowCacheNodeInfo: true
	});
	let node_with_endpoint = arrayutilities.find(result.CacheNodes, cache_node => {
		return objectutilities.hasRecursive(cache_node, 'Endpoint.Address');
	});
	let endpoint = node_with_endpoint.Endpoint.Address;

	du.debug('ElastiCache: ' + endpoint);
	return endpoint;

}

module.exports.getSubnet1 = async () => {

	require('@6crm/sixcrmcore');

	if (global.SixCRM.configuration.isLocal()) {
		return '';
	}

	const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
	const EC2Deployment = global.SixCRM.routes.include('deployment', 'utilities/ec2-deployment.js');
	let ec2_deployment = new EC2Deployment();

	let subnet = await ec2_deployment.subnetExists({Name: 'sixcrm-private1'});

	du.info('VPCSubnet1: '+subnet.SubnetId);
	return subnet.SubnetId;

}

module.exports.getSubnet2 = async () => {

	require('@6crm/sixcrmcore');

	if (global.SixCRM.configuration.isLocal()) {
		return '';
	}

	const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
	const EC2Deployment = global.SixCRM.routes.include('deployment', 'utilities/ec2-deployment.js');
	let ec2_deployment = new EC2Deployment();

	let subnet = await ec2_deployment.subnetExists({Name: 'sixcrm-private2'});

	du.info('VPCSubnet2: '+subnet.SubnetId);
	return subnet.SubnetId;

}

module.exports.getSubnet3 = async () => {

	require('@6crm/sixcrmcore');

	if (global.SixCRM.configuration.isLocal()) {
		return '';
	}

	const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
	const EC2Deployment = global.SixCRM.routes.include('deployment', 'utilities/ec2-deployment.js');
	let ec2_deployment = new EC2Deployment();

	let subnet = await ec2_deployment.subnetExists({Name: 'sixcrm-private3'});

	du.info('VPCSubnet3: '+subnet.SubnetId);
	return subnet.SubnetId;

}

module.exports.getSecurityGroup = async () => {

	require('@6crm/sixcrmcore');

	if (global.SixCRM.configuration.isLocal()) {
		return '';
	}

	const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
	const EC2Deployment = global.SixCRM.routes.include('deployment', 'utilities/ec2-deployment.js');
	let ec2_deployment = new EC2Deployment();

	let security_group = await ec2_deployment.securityGroupExists({GroupName: global.SixCRM.configuration.site_config.lambda.security_group});

	du.info('Lambda Security Group: '+security_group.GroupId);
	return security_group.GroupId;

}

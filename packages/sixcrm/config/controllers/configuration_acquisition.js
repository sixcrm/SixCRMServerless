require('@6crm/sixcrmcore');
const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;

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

module.exports.getAuroraClusterEndpoint = (config, force) => {

	require('@6crm/sixcrmcore');

	const auroraConfig = global.SixCRM.configuration.site_config.aurora;
	const host = auroraConfig && auroraConfig.host;

	if (global.SixCRM.configuration.isLocal()) {

		du.debug(`getAuroraClusterEndpoint: LOCAL = ${host}`);

		return host;

	}

	du.debug(`getAuroraClusterEndpoint: AURORA_PROXY = ${process.env.AURORA_PROXY} FORCE = ${force}`);

	// if its running on circle and creating the SSH tunnel we need the real endpoint,
	// otherwise it is hitting the tunnel
	if (process.env.AURORA_PROXY && !force) {

		du.debug(`getAuroraClusterEndpoint: POINTED AT PROXY`);

		return '127.0.0.1';

	}

	return host;

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

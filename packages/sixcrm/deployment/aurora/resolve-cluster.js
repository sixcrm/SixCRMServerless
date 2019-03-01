require('@6crm/sixcrmcore');

const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const configuration = require('../../config/controllers/configuration_acquisition');
const fs = require('fs');
const util = require('util');

resolve().catch((ex) => {

	du.error(ex);

});

async function resolve() {

	const auroraEndpoint = configuration.getAuroraClusterEndpoint(null, true);
	const proxyEndpoint = await configuration.getProxyEndpoint();
	du.debug(`Aurora endpoint: ${auroraEndpoint}`);
	du.debug(`Proxy endpoint: ${proxyEndpoint}`);
	const writeFile = util.promisify(fs.writeFile);
	await writeFile('./aurora-env', `AURORA_HOST=${auroraEndpoint}\nPROXY_HOST=${proxyEndpoint}`);

}

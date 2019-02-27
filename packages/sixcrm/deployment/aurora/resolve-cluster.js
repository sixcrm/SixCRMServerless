require('@6crm/sixcrmcore');

const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const configuration = require('../../config/controllers/configuration_acquisition');
const fs = require('fs');
const util = require('util');

resolve().catch((ex) => {

	du.error(ex);

});

async function resolve() {

	const auroraEndpoint = await configuration.getAuroraClusterEndpoint(null, true);
	const proxyEndpoint = await configuration.getProxyEndpoint();
	const writeFile = util.promisify(fs.writeFile);
	await writeFile('./aurora-env', `AURORA_HOST=${auroraEndpoint}\nPROXY_HOST=${proxyEndpoint}`);

}

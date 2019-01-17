const _ = require('lodash');
const Bluebird = require('bluebird');

require('@6crm/sixcrmcore');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const DynamoClient = require('./dynamo');
const dynamoClient = new DynamoClient();

const auroraContext = require('@6crm/sixcrmcore/util/analytics/aurora-context').default;
const configurationAcquistion = require('../../config/controllers/configuration_acquisition');
configurationAcquistion.getAuroraClusterEndpoint().then(async (endpoint) => {

	process.env.aurora_host = endpoint;
	await auroraContext.init();

	await auroraContext.withConnection(async connection => {

		du.info("Connection established");

		const idsResult = await connection.query(`SELECT id FROM analytics.f_rebill`);
		const ids = _.map(idsResult.rows, row => row.id);

		du.info(`${ids.length} order records found`);

		await Bluebird.each(ids, (id, index) => updateOrder(connection, id, index));

	});

	return auroraContext.dispose();

}).catch(err => {

	du.fatal("Error updating order records", err);

	return auroraContext.dispose();

});

async function updateOrder(connection, id, index) {

	const order = await dynamoClient.get('rebills', id);
	if (order) {

		du.info(`${index}\t${id}\t${order.bill_at}`);

		if (process.env.DRY_RUN !== 'false') {
			return;
		}

		return connection.queryWithArgs(`
			UPDATE analytics.f_rebill SET
				datetime = $1
			WHERE id = $2`,
		[
			order.bill_at,
			id
		]);

	}

}

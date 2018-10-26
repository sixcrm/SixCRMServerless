const _ = require('lodash');
const Bluebird = require('bluebird');

require('@6crm/sixcrmcore');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;

const TransactionController = require('../../controllers/entities/Transaction');

const transactionController = new TransactionController();

transactionController.disableACLs();

const auroraContext = require('@6crm/sixcrmcore/util/analytics/aurora-context').default;
const configurationAcquistion = require('../../config/controllers/configuration_acquisition');

const batchSize = 25;

configurationAcquistion.getAuroraClusterEndpoint().then(async (endpoint) => {

	process.env.aurora_host = endpoint;
	await auroraContext.init();

	await auroraContext.withConnection(async connection => {

		du.info("Connection established");

		const idsResult = await connection.query(`SELECT id from analytics.f_transaction t where t.processor_result = 'decline' or t.processor_result = 'softdecline'`);
		const ids = _.map(idsResult.rows, row => row.id);

		du.info(`${ids.length} transaction records found`);

		let batch = [];

		await Bluebird.each(ids, async (id, index) => {
			batch.push(updateTransaction(connection, id, index));

			if (batch.length === batchSize) {
				await Promise.all(batch);
				batch = [];
			}
		});

		if (batch.length) {
			await Promise.all(batch);
		}

	});

	return auroraContext.dispose();

}).catch(err => {

	du.fatal("Error updating transaction records", err);

	return auroraContext.dispose();

});

async function updateTransaction(connection, id, index) {

	let
		result = null;

	const transaction = await transactionController.get({id});
	if (transaction && transaction.result) {

		result = transaction.result;
	}

	du.info(`${index}\t${id}\t${result}`);

	if (process.env.DRY_RUN !== 'false') {
		return;
	}

	return connection.queryWithArgs(`
		UPDATE analytics.f_transaction SET
			processor_result	 = $1
		WHERE id = $2`,
	[
		result,
		id
	]);

}

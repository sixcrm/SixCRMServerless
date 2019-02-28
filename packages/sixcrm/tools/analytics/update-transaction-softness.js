const _ = require('lodash');
const Bluebird = require('bluebird');

require('@6crm/sixcrmcore');
const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;

const TransactionController = require('../../controllers/entities/Transaction');

const transactionController = new TransactionController();

transactionController.disableACLs();

const auroraContext = require('@6crm/sixcrmcore/lib/util/analytics/aurora-context').default;
const configurationAcquistion = require('../../config/controllers/configuration_acquisition');

const batchSize = 25;

const RESULT_MAP = {
	success: 'success',
	error: 'error',
	decline: 'soft decline',
	soft: 'soft decline',
	harddecline: 'hard decline'
};

process.env.aurora_host = configurationAcquistion.getAuroraClusterEndpoint();

auroraContext.init().then(async () => {

	await auroraContext.withConnection(async connection => {

		du.info("Connection established");

		const idsResult = await connection.query(`
			SELECT id from analytics.f_transaction t where
				t.processor_result != 'success' and
				t.processor_result != 'error' and
				t.processor_result != 'fail'
			`);
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

		result = RESULT_MAP[transaction.result] || transaction.result;
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

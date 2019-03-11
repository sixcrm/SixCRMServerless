const _ = require('lodash');
const Bluebird = require('bluebird');

require('@6crm/sixcrmcore');
const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;

const TransactionController = require('../../controllers/entities/Transaction');

const transactionController = new TransactionController();

transactionController.disableACLs();

const auroraContext = require('@6crm/sixcrmcore/lib/util/analytics/aurora-context').default;

const batchSize = 25;

auroraContext.init().then(async () => {

	await auroraContext.withConnection(async connection => {

		du.info("Connection established");

		const idsResult = await connection.query(`SELECT id from analytics.f_transaction`);
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
		merchantCode = null,
		merchantMessage = null;

	const transaction = await transactionController.get({id});
	if (transaction && transaction.processor_response) {
		const response = JSON.parse(transaction.processor_response);

		merchantCode = response.merchant_code;
		merchantMessage = response.merchant_message;
	}

	du.info(`${index}\t${id}\t${merchantCode}\t${merchantMessage}`);

	if (process.env.DRY_RUN !== 'false' || !merchantMessage) {
		return;
	}

	return connection.queryWithArgs(`
		UPDATE analytics.f_transaction SET
			merchant_code	 = $1,
			merchant_message = $2
		WHERE id = $3`,
	[
		merchantCode,
		merchantMessage,
		id
	]);

}

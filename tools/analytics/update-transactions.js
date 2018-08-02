const _ = require('lodash');
const Bluebird = require('bluebird');

require('@6crm/sixcrmcore');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;

const TransactionController = require('../../controllers/entities/Transaction');
const RebillController = require('../../controllers/entities/Rebill');
const CustomerController = require('../../controllers/entities/Customer');
const SessionController = require('../../controllers/entities/Session');

const transactionController = new TransactionController();
const rebillController = new RebillController();
const customerController = new CustomerController();
const sessionController = new SessionController();

transactionController.disableACLs();

const auroraContext = require('@6crm/sixcrmcore/util/analytics/aurora-context').default;
const configurationAcquistion = require('../../config/controllers/configuration_acquisition');
configurationAcquistion.getAuroraClusterEndpoint().then(async (endpoint) => {

	process.env.aurora_host = endpoint;
	await auroraContext.init();

	await auroraContext.withConnection(async connection => {

		du.info("Connection established");

		const idsResult = await connection.query(`SELECT id from analytics.f_transaction`);
		const ids = _.map(idsResult.rows, row => row.id);

		du.info(`${ids.length} transaction records found`);

		await Bluebird.each(ids, (id, index) => updateTransaction(connection, id, index));

	});

	return auroraContext.dispose();

}).catch(err => {

	du.fatal("Error updating transaction records", err);

	return auroraContext.dispose();

});

async function updateTransaction(connection, id, index) {

	let
		transactionAlias = null,
		sessionAlias = null,
		rebillId = null,
		rebillAlias = null,
		customerName = null;

	const transaction = await transactionController.get({id});
	if (transaction) {
		transactionAlias = transaction.alias;
		rebillId = transaction.rebill;

		const rebill = await rebillController.get({id: transaction.rebill});
		if (rebill) {
			rebillAlias = rebill.alias;

			const session = await sessionController.get({id: rebill.parentsession});
			if (session) {
				sessionAlias = session.alias;

				const customer = await customerController.get({id: session.customer});
				if (customer) {
					customerName = `${customer.firstname} ${customer.lastname}`;
				}
			}
		}
	}

	du.info(`${index}\t${id}\t${transactionAlias}\t${sessionAlias}\t${rebillId}\t${rebillAlias}\t${customerName}`);

	return connection.queryWithArgs(`
		UPDATE analytics.f_transaction SET
			alias = $1,
			session_alias = $2,
			rebill = $3,
			rebill_alias = $4,
			customer_name = $5
		WHERE id = $6`,
	[
		transactionAlias,
		sessionAlias,
		rebillId,
		rebillAlias,
		customerName,
		id
	]);

}

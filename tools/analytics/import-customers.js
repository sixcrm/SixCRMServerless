const _ = require('lodash');

require('@6crm/sixcrmcore');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;

const DynamoClient = require('./dynamo');
const dynamoClient = new DynamoClient();

const auroraContext = require('@6crm/sixcrmcore/util/analytics/aurora-context').default;
const configurationAcquistion = require('../../config/controllers/configuration_acquisition');

dynamoClient.scan('customers').then(async result => {

	du.info(`${result.Items.length} customers`);

	const customerRows = result.Items.map(customer => [
		customer.id,
		customer.account,
		customer.firstname,
		customer.lastname,
		customer.email,
		customer.phone,
		customer.address && customer.address.city,
		customer.address && customer.address.state,
		customer.address && customer.address.zip,
		customer.created_at,
		customer.updated_at
	]);

	process.env.aurora_host = await configurationAcquistion.getAuroraClusterEndpoint();
	await auroraContext.init();

	let query = `INSERT INTO analytics.f_customer (id, account, firstname, lastname, email, phone, city, state, zip, created_at, updated_at) VALUES `;
	const values = customerRows.map((r, i) => {

		return (`(${Array.from(r, (val, index) => (i * r.length) + index + 1).map(n => `$${n}`).join(',')})`);

	});
	query += values.join(',');
	query += ' ON CONFLICT (id) DO NOTHING';

	if (process.env.DRY_RUN !== 'false') {

		return;

	}

	await auroraContext.withConnection(async db => {

		return db.queryWithArgs(query, _.flatten(customerRows));

	});

	return auroraContext.dispose();

}).catch(err => {

	du.fatal('Error importing customers', err);

	return auroraContext.dispose();

});

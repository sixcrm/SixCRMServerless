const expect = require('chai').expect;

module.exports = async (connection) => {

	const result = await connection.query('SELECT COUNT(1) as c FROM analytics.f_transaction_chargeback');
	expect(result.rows[0].c).to.be.equal((1).toString());

}

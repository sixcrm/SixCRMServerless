const expect = require('chai').expect;

module.exports = async (connection) => {

	const result = await connection.query('SELECT COUNT(1) as c FROM analytics.f_transaction');
	expect(result.rows[0].c).to.be.equal((2).toString());
	const result2 = await connection.query('SELECT COUNT(1) as c FROM analytics.f_transaction_product');
	expect(result2.rows[0].c).to.be.equal((2).toString());
	const result3 = await connection.query('SELECT COUNT(1) as c FROM analytics.f_transaction_product_schedule');
	expect(result3.rows[0].c).to.be.equal((2).toString());

}

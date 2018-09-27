const expect = require('chai').expect;

module.exports = async (connection) => {

	const result = await connection.query(`SELECT * FROM analytics.f_rebill WHERE status = 'processed'`);
	expect(result.rowCount).to.be.equal(1);

	const shippedResult = await connection.query(`SELECT * FROM analytics.f_rebill WHERE status = 'shipped'`);
	expect(shippedResult.rowCount).to.be.equal(1);

}

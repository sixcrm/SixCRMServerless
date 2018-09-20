const expect = require('chai').expect;

module.exports = async (connection) => {

	const result = await connection.query(`SELECT * FROM analytics.f_subscription WHERE session = '034087fc-73a1-4594-86de-8490c4db2025'`);
	expect(result.rowCount).to.be.equal(2);

}

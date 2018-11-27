const expect = require('chai').expect;

module.exports = async (connection) => {

	const result = await connection.query(`SELECT * FROM analytics.f_subscription WHERE status = 'active'`);
	expect(result.rowCount).to.be.equal(2);

	const inactiveResult = await connection.query(`SELECT * FROM analytics.f_subscription WHERE cycle = 2`);
	expect(inactiveResult.rowCount).to.be.equal(1);

}

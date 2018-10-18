const expect = require('chai').expect;

module.exports = async (connection) => {

	const result = await connection.query(`SELECT * FROM analytics.d_customer WHERE zip = '22102'`);
	expect(result.rowCount).to.be.equal(1);

	const outdatedResult = await connection.query(`SELECT * FROM analytics.d_customer WHERE zip = '20164'`);
	expect(outdatedResult.rowCount).to.be.equal(0);

	const updatedResult = await connection.query(`SELECT * FROM analytics.d_customer WHERE zip = '20152'`);
	expect(updatedResult.rowCount).to.be.equal(1);

}

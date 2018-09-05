const expect = require('chai').expect;

module.exports = async (connection) => {

	const result = await connection.query(`SELECT * FROM analytics.f_rebill`);

	expect(result.rowCount).to.be.equal(2);

}

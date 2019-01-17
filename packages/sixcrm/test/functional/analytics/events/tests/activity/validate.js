const expect = require('chai').expect;

module.exports = (connection) => {

	return Promise.resolve()
		.then(() => connection.query('SELECT COUNT(1) as c FROM analytics.f_activity'))
		.then((result) => {

			return expect(result.rows[0].c).to.be.equal((1).toString());

		})

}
const expect = require('chai').expect;

module.exports = (connection) => {

	return Promise.resolve()
		.then(() => connection.query('SELECT COUNT(1) as c FROM analytics.f_transactions'))
				.then((result) => {

					return expect(result.rows[0].c).to.be.equal((2).toString());

				})

}
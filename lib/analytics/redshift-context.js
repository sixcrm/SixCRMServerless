const PostgresContext = require('./postgres-context');

class RedshiftContext extends PostgresContext {

	constructor() {

		super('redshift');

	}

}

module.exports = new RedshiftContext();

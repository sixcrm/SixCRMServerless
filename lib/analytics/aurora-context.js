const PostgresContext = require('./postgres-context');

class AuroraContext extends PostgresContext {

	constructor() {

		super('aurora');

	}

}

module.exports = new AuroraContext();

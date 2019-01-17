import PostgresContext from './postgres-context';

export class AuroraContext extends PostgresContext {

	constructor() {

		super('aurora');

	}

}

export default new AuroraContext();

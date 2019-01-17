import PostgresContext from './postgres-context';

export class RedshiftContext extends PostgresContext {

	constructor() {

		super('redshift');

	}

}

export default new RedshiftContext();

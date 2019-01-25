import {DynamoConnector} from "./DynamoConnector";
import {AuroraConnector} from "./AuroraConnector";
import {connect} from "../../connect";
import Product from "../../models/Product";

const dynamoConfig = {
	"region": "us-east-1",
	"account": "068070110666"
};

const auroraConfig = {
	host: 'localhost',
	username: 'postgres',
	password: '',
	schema: 'public',
	logging: ['error']
};

export abstract class DataMigration {

	protected dynamoConnector: DynamoConnector;
	protected auroraConnector: AuroraConnector;

	async prepare(): Promise<void> {
		this.dynamoConnector = new DynamoConnector(dynamoConfig);
		this.auroraConnector = new AuroraConnector(await connect(auroraConfig), Product)
	}

	abstract migrate(): Promise<void>;

	async cleanup(): Promise<void> {
		this.auroraConnector.connection.close();
	}

	async execute(): Promise<void> {
		await this.prepare();
		await this.migrate();
		await this.cleanup();
	}

	getOneFromDynamo(entityName: string, id: string): Promise<any> {
		return this.dynamoConnector.getOne(entityName, id);
	}

	getAllFromDynamo(entityName: string): Promise<any> {
		return this.dynamoConnector.getAll(entityName);
	}

	getOneFromAurora(id: any): Promise<any> {
		return this.auroraConnector.getOne(id);
	}

	getAllFromAurora(): Promise<any> {
		return this.auroraConnector.getAll();
	}

	saveOneToAurora(entity: any): Promise<void> {
		return this.auroraConnector.save(entity);
	}

}

import {DynamoConnector} from "./DynamoConnector";
import {AuroraConnector} from "./AuroraConnector";
import {connect} from "../../connect";

export abstract class DataMigration {

	protected dynamoConfig = {
		"region": "us-east-1",
		"account": "068070110666"
	};

	protected auroraConfig = {
		host: 'localhost',
		username: 'postgres',
		password: '',
		schema: 'public',
		logging: ['error']
	};

	protected auroraConfigDev = {
		host: 'localhost',
		username: 'root',
		password: 'Jagodica9',
		schema: 'product_setup',
		logging: ['error']
	};

	protected dynamoConnector: DynamoConnector;
	protected auroraConnector: AuroraConnector;

	async prepare(): Promise<void> {
		this.dynamoConnector = new DynamoConnector(this.dynamoConfig);
		this.auroraConnector = new AuroraConnector(await connect(this.auroraConfig), this.getModelClass());
	}

	abstract migrate(): Promise<void>;

	abstract getModelClass();

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

	deleteOneFromAurora(id: any): Promise<void> {
		return this.auroraConnector.deleteOne(id);
	}
}

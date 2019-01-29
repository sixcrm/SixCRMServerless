import {EntitySchema, ObjectType, Connection} from "typeorm";

export class AuroraConnector {

	public readonly repository;
	public readonly connection: Connection;
	private readonly objectType;

	constructor(connection: Connection, objectType: ObjectType<any> | EntitySchema<any>) {
		this.repository = connection.getRepository(objectType);
		this.connection = connection;
		this.objectType = objectType;
	}

	public async save(entity: any): Promise<any> {
		return this.connection.createQueryBuilder().insert().into(this.objectType).values([entity]).execute();
	}

	public getAll(): Promise<void> {
		return this.repository.find({});
	}

	public getOne(id: any): Promise<void> {
		return this.repository.findOneOrFail({id});
	}

	public deleteOne(id: any): Promise<void> {
		return this.repository.delete(id);
	}

}

import {EntitySchema, ObjectType} from "typeorm";

export class AuroraConnector {

	public readonly repository;

	constructor(connection, objectType: ObjectType<any> | EntitySchema<any>) {
		this.repository = connection.getRepository(objectType)
	}

	public save(entity: any): Promise<void> {
		return this.repository.save(entity);
	}

	public getAll(): Promise<void> {
		return this.repository.find({});
	}
	public getOne(id: any): Promise<void> {
		return this.repository.findOneOrFail({id});
	}

}

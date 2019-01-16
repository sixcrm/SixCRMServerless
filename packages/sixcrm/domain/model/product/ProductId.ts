import {Identity} from "../Identity";
import {UUID} from "../uuid/Uuid";

export class ProductId extends Identity<UUID> {

	constructor(id: UUID = new UUID()) {
		super(id);
	}

	static of(stringUuid: string): ProductId {
		return new ProductId(new UUID(stringUuid));
	}

	equals(other: ProductId): boolean {
		return this.id.sameValueAs(other.id);
	}

	get value(): any {
		return this.id.value;
	}

}

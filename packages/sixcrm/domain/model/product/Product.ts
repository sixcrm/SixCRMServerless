import {AbstractEntity} from "../AbstractEntity";
import {ProductId} from "./ProductId";
import {Entity} from "../Entity";

export class Product extends AbstractEntity<ProductId>{

	name: string;

	constructor(id: ProductId, name: string) {
		super(id);
		this.name = name;
	}

	sameIdentityAs(other: Entity<ProductId>): boolean {
		return this.id.equals(other.id);
	}


}

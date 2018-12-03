import {Entity} from "./Entity";
import {Identity} from "./Identity";

export abstract class AbstractEntity<I extends Identity<any>> implements Entity<I> {

	readonly id: I;

	protected constructor(id: I) {
		this.id = id;
	}

	abstract sameIdentityAs(other: Entity<I>): boolean;

}

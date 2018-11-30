import {Entity} from "./Entity";

export abstract class AbstractEntity<I> implements Entity<I> {

	readonly id: I;

	protected constructor(id: I) {
		this.id = id;
	}

	abstract sameIdentityAs(other: Entity<I>): boolean;

}

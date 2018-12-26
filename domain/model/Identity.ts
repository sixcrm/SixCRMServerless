/**
 * Identity of an Entity.
 */
export abstract class Identity<T> {
	/**
	 * This is where Identity holds it's value. Can be primitive type or a class.
	 */
	public readonly id: T;

	/**
	 * Used for exposing the value if the id if id is not a primitive type.
	 */
	public readonly value: any;

	protected constructor(id: T) {
		this.id = id;
	}
	abstract equals(other: Identity<T>): boolean;
}

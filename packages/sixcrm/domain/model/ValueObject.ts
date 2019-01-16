/**
 * Value objects have no identities, for example email address or amount of money.
 * Two value objects are same it they have same values.
 */
export interface ValueObject<T> {

	sameValueAs(other: ValueObject<T>): boolean;
}

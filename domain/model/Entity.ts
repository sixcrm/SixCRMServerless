/**
 * Entities have identities, two entities are same if they have same identities.
 */
export interface Entity<I> {

	readonly id: I;

	sameIdentityAs(other: Entity<I>): boolean

}

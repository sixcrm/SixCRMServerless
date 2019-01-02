/**
 * Entities have identities, two entities are same if they have same identities.
 */
import {Identity} from "./Identity";

export interface Entity<I extends Identity<any>> {

	readonly id: I;

	sameIdentityAs(other: Entity<I>): boolean

}

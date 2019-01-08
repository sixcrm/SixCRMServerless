/**
 * DBO - DataBase Object. Used for representing values that come from and go to the database. Can be used as
 * object mappers, decorated with ORM decorations/annotations etc. DBOs are aware of Entities, but not vice-versa,
 * otherwise implementation (data store) details are leaking into the domain.
 */
export interface Dbo<E> {
	toEntity(): E;
}

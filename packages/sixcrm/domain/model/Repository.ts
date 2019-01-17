export interface Repository<I, T> {
	getOne(id: I): Promise<T>
}

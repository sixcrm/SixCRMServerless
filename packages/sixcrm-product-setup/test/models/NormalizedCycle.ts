import Cycle from "../../src/models/Cycle";

export interface NormalizedCycleType {
	id: string,
	name: string,
	is_monthly: boolean,
	length: number,
	position: number,
	next_position: number,
	price: number,
	shipping_price: number,
}

export default class NormalizedCycle {

	private readonly normalizedEntity: NormalizedCycleType;

	constructor(entity: Cycle) {
		this.normalizedEntity = {
			id: entity.id,
			name: entity.name,
			is_monthly: entity.is_monthly,
			length: entity.length,
			position: entity.position,
			next_position: entity.next_position,
			price: parseInt(entity.price + ''),
			shipping_price: parseInt(entity.shipping_price + '')
		}
	}

	static of(entity: Cycle): NormalizedCycleType {
		return new NormalizedCycle(entity).valueOf();
	}

	valueOf(): NormalizedCycleType {
		return this.normalizedEntity;
	}
}


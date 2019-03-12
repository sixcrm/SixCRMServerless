import Cycle, { IProductScheduleInterval } from "../../src/models/Cycle";
import NormalizedCycleProduct, {NormalizedCycleProductType} from "./NormalizedCycleProduct";
import { Product } from "../../src";

export interface NormalizedCycleType {
	name: string,
	length: string,
	position: number,
	next_position: number,
	price: number,
	shipping_price: number,
	cycle_products: NormalizedCycleProductType[]
}

const normalizeLength = (length: IProductScheduleInterval | string) => {
	if ((length as IProductScheduleInterval).months) {
		return `${(length as IProductScheduleInterval).months} months`;
	}
	if ((length as IProductScheduleInterval).days) {
		return `${(length as IProductScheduleInterval).days} days`;
	}
	return (length as string);
};

export default class NormalizedCycle {

	private readonly normalizedEntity: NormalizedCycleType;

	constructor(entity: Cycle) {
		this.normalizedEntity = {
			name: entity.name,
			length: normalizeLength(entity.length),
			position: entity.position,
			next_position: entity.next_position,
			price: parseInt(entity.price + ''),
			shipping_price: parseInt(entity.shipping_price + ''),
			cycle_products: (entity.cycle_products || [])
				.sort((a, b) => (a.product as Product).id < (b.product as Product).id ? -1 : 1)
				.map(cycle_product => NormalizedCycleProduct.of(cycle_product))
		}
	}

	static of(entity: Cycle): NormalizedCycleType {
		return new NormalizedCycle(entity).valueOf();
	}

	valueOf(): NormalizedCycleType {
		return this.normalizedEntity;
	}
}


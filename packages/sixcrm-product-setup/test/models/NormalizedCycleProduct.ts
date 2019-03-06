import CycleProduct from "../../src/models/CycleProduct";
import NormalizedProduct, {NormalizedProductType} from "./NormalizedProduct";

export interface NormalizedCycleProductType {
	product: NormalizedProductType,
	quantity: number,
	is_shipping: boolean,
	position: number
}

export default class NormalizedCycleProduct {

	private readonly normalizedEntity: NormalizedCycleProductType;

	constructor(entity: CycleProduct) {
		this.normalizedEntity = {
			product: NormalizedProduct.of(entity.product),
			quantity: entity.quantity,
			is_shipping: entity.is_shipping,
			position: entity.position
		}
	}

	static of(entity: CycleProduct): NormalizedCycleProductType {
		return new NormalizedCycleProduct(entity).valueOf();
	}

	valueOf(): NormalizedCycleProductType {
		return this.normalizedEntity;
	}
}


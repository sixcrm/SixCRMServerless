import Product from './Product';

export default class CycleProduct {

	cycle_id: string;
	product: Partial<Product>;
	quantity: number;
	is_shipping: boolean;
	position: number;

	public constructor(obj?:Partial<CycleProduct>) {
		Object.assign(this, obj);
	}
}

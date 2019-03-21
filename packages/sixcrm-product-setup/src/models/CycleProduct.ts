import Product from './Product';
import DomainEntity from "./DomainEntity";

export default class CycleProduct extends DomainEntity {

	cycle_id: string;
	product: Partial<Product>;
	quantity: number;
	is_shipping: boolean;
	position: number;

	public constructor(obj?:Partial<CycleProduct>) {
		super();
		Object.assign(this, obj);
	}

	validate(): boolean {
		return true;
	}
}

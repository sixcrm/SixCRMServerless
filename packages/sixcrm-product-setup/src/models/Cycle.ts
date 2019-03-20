import CycleProduct from './CycleProduct';
import ProductSchedule from './ProductSchedule';
import DomainEntity from "./DomainEntity";
import CycleValidator from "./validators/CycleValidator";

export interface IProductScheduleInterval {
	months?: number;
	days?: number;
}

export default class Cycle extends DomainEntity {

	id: string;
	product_schedule_id: string;
	cycle_products: CycleProduct[];
	name: string;
	length: IProductScheduleInterval | string;
	position: number;
	next_position: number;
	price: number | string;
	shipping_price: number | string | null;

	validate(): boolean {
		return new CycleValidator(this).validate();
	}

	public constructor(obj?:Partial<Cycle>) {
		super();
		Object.assign(this, obj);
	}

}

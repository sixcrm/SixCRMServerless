import { IsNotEmpty, Min, IsOptional } from "class-validator";

import SubscriptionCycleProduct from './SubscriptionCycleProduct';
import DomainEntity from "@6crm/sixcrm-data/lib/DomainEntity";
import SubscriptionCycleValidator from "./validators/SubscriptionCycleValidator";
import { IProductScheduleInterval } from "@6crm/sixcrm-product-setup/lib/models/Cycle";

export default class SubscriptionCycle extends DomainEntity {

	id: string;

	cycle_products: SubscriptionCycleProduct[];

	@IsNotEmpty()
	@IsOptional()
	name: string;

	created_at: Date;
	updated_at: Date;

	length: IProductScheduleInterval | string;

	@IsNotEmpty()
	position: number;

	@IsOptional()
	next_position: number;

	@IsNotEmpty()
	@Min(0)
	price: number | string;

	@Min(0)
	@IsOptional()
	shipping_price: number | string | undefined;

	validate(): boolean {
		return new SubscriptionCycleValidator(this).validate();
	}

	constructor(
		id: string,
		name: string,
		created_at: Date,
		updated_at: Date,
		length: IProductScheduleInterval,
		position: number,
		next_position: number,
		price: number | string,
		shipping_price: number | string | undefined,
		cycle_products: SubscriptionCycleProduct[]
	) {
		super();
		this.id = id;
		this.name = name;
		this.created_at = created_at;
		this.updated_at = updated_at;
		this.length = length;
		this.position = position;
		this.next_position = next_position;
		this.price = price;
		this.shipping_price = shipping_price;
		this.cycle_products = cycle_products;
	}
}

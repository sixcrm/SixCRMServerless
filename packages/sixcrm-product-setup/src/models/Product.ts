import DomainEntity from "./DomainEntity";

export interface IProductInterval {
	hours?: number;
	minutes?: number;
	seconds?: number;
}

export default class Product extends DomainEntity {

	id: string;
	account_id: string;
	name: string;
	price: number | string;
	is_shippable: boolean;
	shipping_price: number | string | null;
	shipping_delay?: IProductInterval | null;
	fulfillment_provider_id: string;
	description: string | null;
	sku: string | null;
	image_urls: string[];
	merchant_provider_group_id: string;

	public constructor(obj?:Partial<Product>) {
		super();
		Object.assign(this, obj);
	}

	validate(): boolean {
		return !!this.id && !!this.account_id && !!this.name && this.price > -1;
	}
}

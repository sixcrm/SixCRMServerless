import { IsNotEmpty, Min } from "class-validator";

// Move this to product-setup/models/CycleProduct
export interface ICyclePartialProduct {
	id: string;
	name: string;
	description: string;
	sku: string;
	image_urls: string[];
}

export default class SubscriptionCycleProduct {

	product: ICyclePartialProduct;

	created_at: Date;
	updated_at: Date;

	@IsNotEmpty()
	@Min(1)
	quantity: number;

	@IsNotEmpty()
	is_shipping: boolean;

	@IsNotEmpty()
	@Min(0)
	position: number;

	constructor(
		product: ICyclePartialProduct,
		created_at: Date,
		updated_at: Date,
		quantity: number,
		is_shipping: boolean,
		position: number,
	) {
		this.product = product;
		this.created_at = created_at;
		this.updated_at = updated_at;
		this.quantity = quantity;
		this.is_shipping = is_shipping;
		this.position = position;
	}
}

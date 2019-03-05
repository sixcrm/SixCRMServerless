import Product, {IProductInterval} from "../../src/models/Product";

export interface NormalizedProductType {
	id: string,
	account_id: string,
	name: string,
	price: number,
	is_shippable: boolean,
	shipping_price: number,
	shipping_delay: IProductInterval | null,
	fulfillment_provider_id: string | null,
	description: string,
	sku: string,
	image_urls: string[],
	merchant_provider_group_id: string | null
}

export default class NormalizedProduct {
	private readonly normalizedEntity: NormalizedProductType;

	constructor(entity: Product) {
		this.normalizedEntity = {
			id: entity.id,
			account_id: entity.account_id,
			name: entity.name,
			price: parseInt(entity.price + ''),
			is_shippable: entity.is_shippable,
			shipping_price: parseInt(entity.shipping_price + ''),
			shipping_delay: entity.shipping_delay || null,
			fulfillment_provider_id: entity.fulfillment_provider_id || null,
			description: entity.description || '',
			sku: entity.sku || '',
			image_urls: entity.image_urls,
			merchant_provider_group_id: entity.merchant_provider_group_id || null
		};

	}

	static of(entity: Product) {
		return new NormalizedProduct(entity).valueOf();
	}

	valueOf(): NormalizedProductType {
		return this.normalizedEntity;
	}
}


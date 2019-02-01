import Product, {IProductInterval} from "../Product";

export class LegacyProduct {
	public account;
	public attributes;
	public created_at;
	public default_price;
	public description;
	public dynamic_pricing;
	public fulfillment_provider;
	public id;
	public merchantprovidergroup;
	public name;
	public ship;
	public shipping_delay;
	public sku;
	public updated_at;

	constructor(
		account, attributes, created_at, default_price, description, dynamic_pricing, fulfillment_provider_id, id,
		merchant_provider_group_id, name, ship, shipping_delay, sku, updated_at
	) {
		this.account = account;
		this.attributes = attributes;
		this.created_at = created_at;
		this.default_price = default_price;
		if (description) {
			this.description = description;
		}
		this.dynamic_pricing = dynamic_pricing;
		if (fulfillment_provider_id) {
			this.fulfillment_provider = fulfillment_provider_id;
		}
		this.id = id;
		if (merchant_provider_group_id) {
			this.merchantprovidergroup = merchant_provider_group_id;
		}
		this.name = name;
		this.ship = ship;
		this.shipping_delay = shipping_delay;
		if (sku) {
			this.sku = sku;
		}
		this.updated_at = updated_at;
	}

	public static fromProduct(product: Product): LegacyProduct {
		return new LegacyProduct(
			product.account_id,
			LegacyProduct.toLegacyProductAttributes(product.image_urls),
			product.created_at.toISOString(),
			Number(product.price || 0) + Number(product.shipping_price || 0),
			product.description || '',
			{
				max: 9999999,
				min: 0
			},
			product.fulfillment_provider_id || null,
			product.id,
			product.merchant_provider_group_id || null,
			product.name,
			product.is_shippable,
			product.shipping_delay ? LegacyProduct.shippingIntervalToSeconds(product.shipping_delay) : 0,
			product.sku || null,
			product.updated_at.toISOString()
		);
	}

	public static toLegacyProductAttributes(image_urls: string[]) {
		return {
			images: image_urls.map((path, index) => ({
				default_image: index === 0,
				path
			}))
		};
	}

	public static shippingIntervalToSeconds({ hours = 0, minutes = 0, seconds = 0 }: IProductInterval) {
		return hours * 60 * 60 + minutes * 60 + seconds;
	}

	public toProduct(): Product {
		return {
			account_id: this.account,
			created_at: new Date(this.created_at),
			description: this.description,
			fulfillment_provider_id: this.fulfillment_provider,
			image_urls: this.getImageUrls(),
			is_shippable: this.ship,
			id: this.id,
			merchant_provider_group_id: this.merchantprovidergroup,
			name: this.name,
			price: this.default_price,
			shipping_delay: this.shipping_delay,
			shipping_price: 0,
			sku: this.sku,
			updated_at: new Date(this.updated_at)
		};
	}

	private getImageUrls() {
		if (!this.attributes || !this.attributes.images) {
			return [];
		}

		return this.attributes.images.filter(i => i.path).map(i => i.path);
	}

}

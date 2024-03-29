import { sortBy } from 'lodash';
import Product from "../../models/Product";

export class DynamoProduct {

	static fromArray(items: any[]) {
		return items.map(d => new DynamoProduct(d));
	}
	readonly id: string;
	readonly name: string;
	readonly description: string;
	readonly account: string;
	readonly attributes: any;
	readonly created_at: string;
	readonly updated_at: string;
	readonly default_price: number;
	readonly dynamic_pricing: any;
	readonly ship: boolean;
	readonly shipping_delay: number;
	readonly sku: string;
	readonly fulfillment_provider: string;
	readonly merchantprovidergroup: string;

	constructor(data: any) {
		this.id = this.get(data, 'id.S');
		this.name = this.get(data, 'name.S');
		this.description = this.get(data, 'description.S');
		this.account = this.get(data, 'account.S');
		this.attributes = this.get(data, 'attributes.M');
		this.created_at = this.get(data, 'created_at.S');
		this.updated_at = this.get(data, 'updated_at.S');
		this.default_price = this.get(data, 'default_price.N');
		this.dynamic_pricing = this.get(data, 'dynamic_pricing.M');
		this.ship = this.get(data, 'ship.BOOL');
		this.shipping_delay = this.get(data, 'shipping_delay.N');
		this.sku = this.get(data, 'sku.S');
		this.fulfillment_provider = this.get(data, 'fulfillment_provider.S');
		this.merchantprovidergroup = this.get(data, 'merchantprovidergroup.S');
	}

	toProduct() : Product {
		return Object.assign(
			new Product(this.id, this.account, this.name.substring(0, 55).trim(), Number(this.default_price), !!this.ship, this.getImages()), {
				shipping_price: 0,
				created_at: new Date(this.created_at),
				updated_at: new Date(this.updated_at),
				description: this.description,
				sku: this.sku,
				shipping_delay: this.ship && this.shipping_delay ? { seconds: this.shipping_delay } : undefined,
				fulfillment_provider_id: this.fulfillment_provider,
				merchant_provider_group_id: this.merchantprovidergroup
			});
	}

	private get(object: any, path: string): any {
		return path.split('.').reduce((prev, next) => (prev && prev[next]) ? prev[next] : null, object);
	}

	private getImages() {
		if (!this.attributes || !this.attributes.images) {
			return [];
		}
		const images = sortBy(
			this.attributes.images.L.filter(i => i.M.path).map(i => i.M),
			({ default_image }) => default_image && !default_image.BOOL
		);
		return images.map(image => image.path.S);
	}
}

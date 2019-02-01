import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
	Index,
	Check
} from 'typeorm';

import { IsUUID, IsNotEmpty, Min, ArrayUnique, IsOptional } from "class-validator";

interface IProductInterval {
	hours?: number;
	minutes?: number;
	seconds?: number;
}

const toLegacyProductAttributes = (image_urls: string[]) => ({
	images: image_urls.map((path, index) => ({
		default_image: index === 0,
		path
	}))
});

const shippingIntervalToSeconds = ({ hours = 0, minutes = 0, seconds = 0 }: IProductInterval) => hours * 60 * 60 + minutes * 60 + seconds;

@Entity()
@Check(`"price" >= 0`)
@Check(`"shipping_price" >= 0`)
export default class Product {

	static toLegacyProduct({
		account_id,
		created_at,
		description,
		fulfillment_provider_id,
		image_urls,
		is_shippable,
		id,
		merchant_provider_group_id,
		name,
		price,
		shipping_delay,
		shipping_price = 0,
		sku,
		updated_at,
	}: Product) {
		return {
			account: account_id,
			attributes: toLegacyProductAttributes(image_urls),
			created_at: created_at.toISOString(),
			default_price: Number(price) + Number(shipping_price),
			...(description ? { description } : {}),
			dynamic_pricing: {
				max: 9999999,
				min: 0
			},
			...(fulfillment_provider_id ? { fulfillment_provider: fulfillment_provider_id } : {}),
			id,
			...(merchant_provider_group_id ? { merchantprovidergroup: merchant_provider_group_id } : {}),
			name,
			ship: is_shippable,
			shipping_delay: shipping_delay ? shippingIntervalToSeconds(shipping_delay) : 0,
			...(sku ? { sku } : {}),
			updated_at: updated_at.toISOString()
		};
	}

	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Index()
	@Column('uuid')
	@IsUUID()
	@IsNotEmpty()
	@IsOptional()
	account_id: string;

	@Column({
		length: 55
	})
	@IsNotEmpty()
	name: string;

	@CreateDateColumn()
	created_at: Date;

	@UpdateDateColumn()
	updated_at: Date;

	@Column({
		type: 'numeric',
		precision: 19,
		scale: 2
	})
	@IsNotEmpty()
	@Min(0)
	price: number | string;

	@Column()
	@IsNotEmpty()
	is_shippable: boolean;

	@Column({
		type: 'numeric',
		nullable: true,
		precision: 19,
		scale: 2
	})
	@Min(0)
	@IsOptional()
	shipping_price: number | string;

	@Column({
		type: 'interval',
		nullable: true
	})
	shipping_delay?: IProductInterval;

	@Column({
		type: 'uuid',
		nullable: true
	})
	@IsUUID()
	@IsOptional()
	fulfillment_provider_id: string;

	@Column({
		type: 'text',
		nullable: true
	})
	description: string;

	@Column({
		length: 36,
		nullable: true
	})
	sku: string;

	@Column({
		type: 'text',
		array: true
	})
	@ArrayUnique()
	image_urls: string[];

	@Column({
		type: 'uuid',
		nullable: true
	})
	@IsUUID()
	@IsOptional()
	merchant_provider_group_id: string;

	// Mandatory values only.
	// I'd really like to have a builder as well.
	constructor(
		id: string,
		account_id: string,
		name: string,
		price: number,
		is_shippable: boolean,
		image_urls: string[]
	) {
		this.id = id;
		this.account_id = account_id;
		this.name = name;
		this.created_at = new Date();
		this.updated_at = new Date();
		this.price = price;
		this.is_shippable = is_shippable;
		this.image_urls = image_urls;
	}
}

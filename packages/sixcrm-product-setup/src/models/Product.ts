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

export interface IProductInterval {
	hours?: number;
	minutes?: number;
	seconds?: number;
}

@Entity()
@Check(`"price" >= 0`)
@Check(`"shipping_price" >= 0`)
export default class Product {

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
	shipping_price: number | string | null;

	@Column({
		type: 'interval',
		nullable: true
	})
	shipping_delay?: IProductInterval | null;

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
	description: string | null;

	@Column({
		type: 'varchar',
		length: 36,
		nullable: true
	})
	sku: string | null;

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
		this.created_at = this.updated_at = new Date();
		this.price = price;
		this.is_shippable = is_shippable;
		this.image_urls = image_urls;
	}
}

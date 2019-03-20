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
import Product from "../Product";

export interface IProductInterval {
	hours?: number;
	minutes?: number;
	seconds?: number;
}

@Entity({name: "product"})
@Check(`"price" >= 0`)
@Check(`"shipping_price" >= 0`)
export default class ProductDbo {

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

	public constructor(obj?:Partial<ProductDbo>) {
		Object.assign(this, obj);
	}

	toEntity(): Product {
		return new Product(this);
	}

	static fromEntity(entity: Product): ProductDbo {
		const dbo = new ProductDbo({
			id: entity.id,
			name: entity.name,
			price: entity.price,
			merchant_provider_group_id: entity.merchant_provider_group_id,
			updated_at: entity.updated_at,
			created_at: entity.created_at,
			is_shippable: entity.is_shippable,
			shipping_price: entity.shipping_price,
			fulfillment_provider_id: entity.fulfillment_provider_id,
			description: entity.description,
			sku: entity.sku,
			image_urls: entity.image_urls,
			shipping_delay: entity.shipping_delay,
			account_id: entity.account_id
		});

		// https://github.com/typeorm/typeorm/issues/2651
		delete dbo.updated_at;

		if (!dbo.account_id) {
			delete dbo.account_id;
		}

		return dbo;
	}

}

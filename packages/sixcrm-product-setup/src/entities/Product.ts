import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
	Check
} from 'typeorm';

@Entity()
@Check(`"price" >= 0`)
@Check(`"shipping_price" >= 0`)
export default class Product {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column('uuid')
	account_id: string;

	@Column({
		length: 55
	})
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
	price: number;

	@Column()
	is_shippable: boolean;

	@Column({
		type: 'numeric',
		nullable: true,
		precision: 19,
		scale: 2
	})
	shipping_price: number;

	@Column({
		type: 'interval',
		nullable: true
	})
	shipping_delay: number;

	@Column({
		type: 'uuid',
		nullable: true
	})
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
	image_urls: string[];

	@Column({
		type: 'uuid',
		nullable: true
	})
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

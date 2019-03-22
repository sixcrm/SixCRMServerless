import {
	Entity,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	Check,
	ManyToOne,
	JoinColumn
} from 'typeorm';

import { IsNotEmpty, Min } from "class-validator";

import SubscriptionCycle from './SubscriptionCycle';
import Product from '@6crm/sixcrm-product-setup/lib/models/Product';

@Entity()
@Check(`"quantity" > 0`)
@Check(`"position" >= 0`)
export default class SubscriptionCycleProduct {

	@ManyToOne(type => SubscriptionCycle, cycle => cycle.cycle_products, { primary: true })
	@JoinColumn({ name: 'subscription_cycle_id' })
	cycle: SubscriptionCycle;

	@ManyToOne(type => Product, { primary: true })
	@JoinColumn({ name: 'product_id' })
	product: Partial<Product>;

	@CreateDateColumn()
	created_at: Date;

	@UpdateDateColumn()
	updated_at: Date;

	@Column()
	@IsNotEmpty()
	@Min(1)
	quantity: number;

	@Column()
	@IsNotEmpty()
	is_shipping: boolean;

	@Column()
	@IsNotEmpty()
	@Min(0)
	position: number;

	constructor(
		product: Partial<Product>,
		is_shipping: boolean,
		position: number,
		quantity: number
	) {
		this.product = product;
		this.is_shipping = is_shipping;
		this.position = position;
		this.quantity = quantity;
	}
}

import {
	Entity,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	Check,
	ManyToOne
} from 'typeorm';

import { IsNotEmpty, Min } from "class-validator";

import Cycle from './Cycle';
import Product from './Product';

@Entity()
@Check(`"quantity" > 0`)
@Check(`"position" >= 0`)
export default class CycleProduct {

	@ManyToOne(type => Cycle, cycle => cycle.cycle_products, { primary: true })
	cycle: Cycle;

	@ManyToOne(type => Product, { primary: true })
	product: Product;

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

}

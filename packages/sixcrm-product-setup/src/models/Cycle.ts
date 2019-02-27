import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
	Check,
	ManyToOne,
	OneToMany
} from 'typeorm';

import { IsNotEmpty, Min, IsOptional } from "class-validator";

import CycleProduct from './CycleProduct';
import ProductSchedule from './ProductSchedule';

@Entity()
@Check(`"is_monthly" = true OR "length" IS NOT NULL`)
export default class Cycle {

	@PrimaryGeneratedColumn('uuid')
	id: string;

	@ManyToOne(type => ProductSchedule, product_schedule => product_schedule.cycles)
	product_schedule: ProductSchedule;

	// I wanted to call this products, but products[0].product drove me nuts before, so let's not.  :)
	@OneToMany(type => CycleProduct, cycle_product => cycle_product.cycle)
	cycle_products: CycleProduct[];

	@Column({
		length: 55
	})
	@IsNotEmpty()
	name: string;

	@CreateDateColumn()
	created_at: Date;

	@UpdateDateColumn()
	updated_at: Date;

	@Column()
	@IsNotEmpty()
	is_monthly: boolean;

	@Column()
	@IsOptional()
	length: number;

	@Column()
	@IsNotEmpty()
	position: number;

	@Column()
	@IsOptional()
	next_position: number;

	@Column({
		type: 'numeric',
		precision: 19,
		scale: 2
	})
	@IsNotEmpty()
	@Min(0)
	price: number | string;

	@Column({
		type: 'numeric',
		nullable: true,
		precision: 19,
		scale: 2
	})
	@Min(0)
	@IsOptional()
	shipping_price: number | string | null;

}

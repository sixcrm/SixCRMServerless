import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
	Check,
	ManyToOne,
	OneToMany,
	JoinColumn
} from 'typeorm';

import { IsNotEmpty, Min, IsOptional } from "class-validator";

import CycleProduct from './CycleProduct';
import ProductSchedule from './ProductSchedule';
import DomainEntity from "./DomainEntity";
import CycleValidator from "./validators/CycleValidator";

export interface IProductScheduleInterval {
	months?: number;
	days?: number;
}

@Entity()
export default class Cycle extends DomainEntity {

	@PrimaryGeneratedColumn('uuid')
	id: string;

	@ManyToOne(type => ProductSchedule, product_schedule => product_schedule.cycles)
	@JoinColumn({ name: 'product_schedule_id' })
	product_schedule: ProductSchedule;

	// I wanted to call this products, but products[0].product drove me nuts before, so let's not.  :)
	@OneToMany(type => CycleProduct, cycle_product => cycle_product.cycle, { cascade: true })
	cycle_products: CycleProduct[];

	@Column({
		nullable: true,
		length: 55
	})
	@IsNotEmpty()
	@IsOptional()
	name: string;

	@CreateDateColumn()
	created_at: Date;

	@UpdateDateColumn()
	updated_at: Date;

	@Column({
		type: 'interval'
	})
	length: IProductScheduleInterval | string;

	@Column()
	@IsNotEmpty()
	position: number;

	@Column({
		nullable: true
	})
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

	validate(): boolean {
		return new CycleValidator(this).validate();
	}

	constructor(
		id: string,
		length: IProductScheduleInterval,
		position: number,
		price: number
	) {
		super();
		this.id = id;
		this.length = length;
		this.position = position;
		this.price = price;
	}
}

import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	OneToMany,
	JoinColumn
} from 'typeorm';

import { IsNotEmpty, Min, IsOptional } from "class-validator";
import ProductScheduleDbo from "./ProductScheduleDbo";
import CycleProductDbo from "./CycleProductDbo";
import Cycle from "../Cycle";

import { get } from 'lodash';
import ProductSchedule from "../ProductSchedule";


export interface IProductScheduleInterval {
	months?: number;
	days?: number;
}

@Entity({name: "cycle"})
export default class CycleDbo {

	@PrimaryGeneratedColumn('uuid')
	id: string;

	@ManyToOne(type => ProductScheduleDbo, product_schedule => product_schedule.cycles)
	@JoinColumn({ name: 'product_schedule_id' })
	product_schedule: ProductScheduleDbo;

	// I wanted to call this products, but products[0].product drove me nuts before, so let's not.  :)
	@OneToMany(type => CycleProductDbo, cycle_product => cycle_product.cycle, { cascade: true })
	cycle_products: CycleProductDbo[];

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

	public constructor(obj?:Partial<CycleDbo>) {
		Object.assign(this, obj);
	}

	static fromEntity(entity: Cycle): CycleDbo {
		return new CycleDbo({
			cycle_products: entity.cycle_products.map(cp => CycleProductDbo.fromEntity(cp)),
			created_at: entity.created_at,
			id: entity.id,
			length: entity.id,
			name: entity.name,
			next_position: entity.next_position,
			position: entity.position,
			price: entity.price,
			product_schedule: <ProductScheduleDbo>{ id: entity.product_schedule_id },
			shipping_price: entity.shipping_price,
			updated_at: entity.updated_at
		})
	}

	toEntity(): Cycle {
		return new Cycle({
			id: this.id,
			product_schedule_id: get(this, 'product_schedule.id', null),
			cycle_products: this.cycle_products.map(dbo => dbo.toEntity()),
			name: this.name,
			created_at: this.created_at,
			updated_at: this.updated_at,
			length: this.length,
			position: this.position,
			next_position: this.next_position,
			price: this.price,
			shipping_price: this.shipping_price
		})
	}

}

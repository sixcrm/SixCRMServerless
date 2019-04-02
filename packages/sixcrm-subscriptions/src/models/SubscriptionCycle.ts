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

import SubscriptionCycleProduct from './SubscriptionCycleProduct';
import Subscription from './Subscription';
import DomainEntity from "@6crm/sixcrm-data/lib/DomainEntity";
import SubscriptionCycleValidator from "./validators/SubscriptionCycleValidator";
import { IProductScheduleInterval } from "@6crm/sixcrm-product-setup/lib/models/Cycle";

@Entity()
export default class SubscriptionCycle extends DomainEntity {

	@PrimaryGeneratedColumn('uuid')
	id: string;

	@ManyToOne(type => Subscription, subscription => subscription.cycles)
	@JoinColumn({ name: 'subscription_id' })
	subscription: Subscription;

	@OneToMany(type => SubscriptionCycleProduct, cycle_product => cycle_product.cycle, { cascade: true })
	cycle_products: SubscriptionCycleProduct[];

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
		return new SubscriptionCycleValidator(this).validate();
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

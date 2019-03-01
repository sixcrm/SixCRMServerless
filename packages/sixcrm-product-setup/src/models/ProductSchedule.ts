import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
	Index,
	OneToMany
} from 'typeorm';

import { IsUUID, IsNotEmpty, IsOptional } from "class-validator";

import Cycle from './Cycle';

@Entity()
export default class ProductSchedule {

	@PrimaryGeneratedColumn('uuid')
	id: string;

	@OneToMany(type => Cycle, cycle => cycle.product_schedule, { cascade: true })
	cycles: Cycle[];

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

	@Column('uuid')
	@IsUUID()
	@IsNotEmpty()
	merchant_provider_group_id: string;

	@Column()
	@IsNotEmpty()
	requires_confirmation: boolean;

}

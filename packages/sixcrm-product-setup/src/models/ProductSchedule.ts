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
import EntityValidationError from "../errors/EntityValidationError";
import DomainEntity from "./DomainEntity";
import ProductScheduleValidator from "./validators/ProductScheduleValidator";

@Entity()
export default class ProductSchedule extends DomainEntity {

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

	@Column({
		type: 'uuid',
		nullable: true
	})
	@IsUUID()
	@IsNotEmpty()
	@IsOptional()
	merchant_provider_group_id: string;

	@Column()
	@IsNotEmpty()
	requires_confirmation: boolean;

	public validate(): boolean {
		return new ProductScheduleValidator(this).validate();
	}

	public nextCycle(current: Cycle): Cycle | null {
		let next: number;
		next = current.next_position;

		if (next === -1 || next === null || next === undefined) {
			return null;
		}

		const nextCycle = this.cycles.find(c => c.position === next);
		if (!nextCycle) {
			throw new EntityValidationError('next_position', current, `There is no cycle with position ${next}, possible positions: ${this.cycles.map(c => c.position).join(',')}`);
		}

		return nextCycle;
	}

	constructor(
		id: string,
		account_id: string,
		name: string,
		requires_confirmation: boolean
	) {
		super();
		this.id = id;
		this.account_id = account_id;
		this.name = name;
		this.requires_confirmation = requires_confirmation;
	}

}

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

import SubscriptionCycle from './SubscriptionCycle';
import EntityValidationError from "@6crm/sixcrm-data/lib/EntityValidationError";
import DomainEntity from "@6crm/sixcrm-data/lib/DomainEntity";
import SubscriptionValidator from "./validators/SubscriptionValidator";

@Entity()
export default class Subscription extends DomainEntity {

	@PrimaryGeneratedColumn('uuid')
	id: string;

	@OneToMany(type => SubscriptionCycle, cycle => cycle.subscription, { cascade: true })
	cycles: SubscriptionCycle[];

	@Index()
	@Column('uuid')
	@IsUUID()
	@IsNotEmpty()
	@IsOptional()
	account_id: string;

	@Index()
	@Column('uuid')
	@IsUUID()
	@IsNotEmpty()
	@IsOptional()
	product_schedule_id: string;

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
		return new SubscriptionValidator(this).validate();
	}

	public nextCycle(current: SubscriptionCycle): SubscriptionCycle | null {
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
		product_schedule_id: string,
		name: string,
		requires_confirmation: boolean
	) {
		super();
		this.id = id;
		this.account_id = account_id;
		this.product_schedule_id = product_schedule_id;
		this.name = name;
		this.requires_confirmation = requires_confirmation;
	}

}

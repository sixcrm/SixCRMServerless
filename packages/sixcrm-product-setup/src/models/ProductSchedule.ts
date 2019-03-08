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

	@Column('uuid')
	@IsUUID()
	@IsNotEmpty()
	merchant_provider_group_id: string;

	@Column()
	@IsNotEmpty()
	requires_confirmation: boolean;

	public validate() {
		if (!this.name) {
			this.fail('name');
		}

		if (!this.merchant_provider_group_id) {
			this.fail('merchant_provider_group_id');
		}

		this.cycles.sort((a,b) => a.position - b.position).forEach((cycle, i) => {
			cycle.validate();
			const nextCycle = this.nextCycle(cycle);
			if (nextCycle === null && !this.isLast(i, this.cycles)) {
				this.fail('next_position', cycle, 'Only last cycle can have next position === -1');
			}

			if (cycle.position === 1 && i !== 0) {
				this.fail('next_position', cycle, 'Only first cycle can have position === 1');
			}

			if (this.isLast(i, this.cycles) && cycle.position !== this.cycles.length - 1) {
				this.fail('next_position', cycle, `Last cycle should have position ${this.cycles.length - 1}`);
			}



		});

		return this;
	}

	public nextCycle(current: Cycle): Cycle | null {
		let next: number;
		next = current.next_position;

		if (next === -1) {
			return null;
		}

		const nextCycle = this.cycles.find(c => c.position === next);
		if (!nextCycle) {
			throw new EntityValidationError('next_position', current, `There is no cycle with position ${next}`);
		}

		return nextCycle;
	}

	private fail(propertyName, object: any = this, message?: string) {
		throw new EntityValidationError<ProductSchedule>(propertyName, object, message);
	}

	private isLast(index: number, array: any[]) {
		return index === array.length - 1;
	}

}

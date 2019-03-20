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
import CycleDbo from "./CycleDbo";
import ProductSchedule from "../ProductSchedule";
import Cycle from "../Cycle";
import Product from "../Product";


@Entity({name: "product_schedule"})
export default class ProductScheduleDbo {

	@PrimaryGeneratedColumn('uuid')
	id: string;

	@OneToMany(type => CycleDbo, cycle => cycle.product_schedule, { cascade: true })
	cycles: CycleDbo[];

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

	public constructor(obj?:Partial<ProductScheduleDbo>) {
		Object.assign(this, obj);
	}

	toEntity(): ProductSchedule {
		return new ProductSchedule({
			id: this.id,
			cycles: this.cycles.map(dbo => dbo.toEntity()),
			account_id: this.account_id,
			name: this.name,
			created_at: this.created_at,
			updated_at: this.updated_at,
			merchant_provider_group_id: this.merchant_provider_group_id,
			requires_confirmation: this.requires_confirmation,
		});
	}

	static fromEntity(entity: ProductSchedule): ProductScheduleDbo {
		const dbo = new ProductScheduleDbo({
			id: entity.id,
			cycles: entity.cycles.map(cycle => CycleDbo.fromEntity(cycle)),
			account_id: entity.id,
			created_at: entity.created_at,
			merchant_provider_group_id: entity.merchant_provider_group_id,
			name: entity.name,
			requires_confirmation: entity.requires_confirmation,
			updated_at: entity.updated_at
		});

		// https://github.com/typeorm/typeorm/issues/2651
		delete dbo.updated_at;

		if (!dbo.account_id) {
			delete dbo.account_id;
		}

		return dbo;
	}

}

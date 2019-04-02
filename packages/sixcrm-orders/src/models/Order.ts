import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	Index,
	OneToMany
} from 'typeorm';

import { IsUUID, IsNotEmpty, IsOptional } from "class-validator";

import LineItem from './LineItem';
import Transaction from './Transaction';

@Entity()
export default class Order {

	@PrimaryGeneratedColumn('uuid')
	id: string;

	@OneToMany(type => LineItem, line_item => line_item.order, { cascade: true })
	line_items: LineItem[];

	@OneToMany(type => Transaction, transaction => transaction.order)
	transactions: Transaction[];

	@Index()
	@Column('uuid')
	@IsUUID()
	@IsNotEmpty()
	account_id: string;

	@Column({
		length: 10
	})
	@IsNotEmpty()
	alias: string;

	@CreateDateColumn()
	created_at: Date;

	@Column({
		type: 'uuid',
		nullable: true
	})
	@IsUUID()
	@IsOptional()
	campaign_id: string;

	@Column({
		type: 'uuid'
	})
	@IsUUID()
	customer_id: string;

	// Mandatory values only.
	// I'd really like to have a builder as well.
	constructor(
		id: string,
		account_id: string,
		alias: string,
		campaign_id: string,
		customer_id: string
	) {
		this.id = id;
		this.account_id = account_id;
		this.created_at = new Date();
		this.alias = alias;
		this.campaign_id = campaign_id;
		this.customer_id = customer_id;
	}
}

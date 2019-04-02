import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	ManyToOne,
	ManyToMany,
	JoinColumn,
	JoinTable,
	CreateDateColumn
} from 'typeorm';

import { IsNotEmpty, IsUUID } from 'class-validator';

import Order from './Order';
import LineItem from './LineItem';

@Entity()
export default class Transaction {

	@PrimaryGeneratedColumn('uuid')
	id: string;

	@ManyToOne(type => Order, order => order.transactions)
	@JoinColumn({ name: 'order_id' })
	order: Order;

	@ManyToMany(type => LineItem)
	@JoinTable()
	line_items: LineItem[];

	@CreateDateColumn()
	created_at: Date;

	@Column({
		length: 10
	})
	@IsNotEmpty()
	alias: string;

	@Column('uuid')
	@IsUUID()
	@IsNotEmpty()
	merchant_provider_id: string;

	@Column({
		type: 'numeric',
		precision: 19,
		scale: 2
	})
	@IsNotEmpty()
	amount: number | string;

	@Column('uuid')
	@IsUUID()
	@IsNotEmpty()
	credit_card_id: string;

	@Column({
		length: 20
	})
	@IsNotEmpty()
	type: 'sale' | 'refund' | 'reverse';

	@Column()
	processor_response: string;

	@Column({
		length: 20
	})
	@IsNotEmpty()
	result: 'success' | 'error' | 'soft decline' | 'hard decline';

}

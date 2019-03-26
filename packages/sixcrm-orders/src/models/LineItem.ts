import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	ManyToOne,
	JoinColumn,
	OneToMany
} from 'typeorm';

import { IsNotEmpty } from "class-validator";

import Order from './Order';
import LineItemProduct from './LineItemProduct';

@Entity()
export default class LineItem {

	@PrimaryGeneratedColumn('uuid')
	id: string;

	@ManyToOne(type => Order, order => order.line_items)
	@JoinColumn({ name: 'order_id' })
	order: Order;

	@OneToMany(type => LineItemProduct, line_item_product => line_item_product.line_item)
	products: LineItemProduct[];

	@Column({
		length: 55
	})
	@IsNotEmpty()
	name: string;

	@Column({
		type: 'numeric',
		precision: 19,
		scale: 2
	})
	@IsNotEmpty()
	amount: number | string;

	constructor(
		id: string,
		name: string,
		amount: number | string
	) {

		this.id = id;
		this.name = name;
		this.amount = amount;

	}

}

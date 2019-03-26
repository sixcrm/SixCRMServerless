import {
	Entity,
	ManyToOne,
	Column,
	JoinColumn
} from 'typeorm';

import LineItem from './LineItem';
import { IsUUID } from 'class-validator';

@Entity()
export default class LineItemProduct {

	@ManyToOne(type => LineItem, line_item => line_item.products)
	@JoinColumn({ name: 'line_item_id' })
	line_item: LineItem;

	@Column({
		type: 'uuid'
	})
	@IsUUID()
	product_id: string;

	@Column({
		type: 'varchar',
		length: 36,
		nullable: true
	})
	sku: string | null;

	constructor(product_id: string, sku: string) {

		this.product_id = product_id;
		this.sku = sku;

	}

}

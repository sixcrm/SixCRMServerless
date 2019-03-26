import {
	Entity,
	Column
} from 'typeorm';

import LineItem from './LineItem';
import { IsUUID, IsNotEmpty } from 'class-validator';

@Entity()
export default class SubscriptionLineItem extends LineItem {

	@Column('uuid')
	@IsUUID()
	@IsNotEmpty()
	subscription_id: string;

	constructor(
		id: string,
		name: string,
		amount: number | string,
		subscription_id: string
	) {

		super(id, name, amount);

		this.subscription_id = subscription_id;

	}

}

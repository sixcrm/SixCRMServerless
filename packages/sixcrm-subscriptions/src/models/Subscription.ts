import { IsUUID, IsNotEmpty, IsOptional } from "class-validator";

import SubscriptionCycle from './SubscriptionCycle';
import EntityValidationError from "@6crm/sixcrm-data/lib/EntityValidationError";
import DomainEntity from "@6crm/sixcrm-data/lib/DomainEntity";
import SubscriptionValidator from "./validators/SubscriptionValidator";

export default class Subscription extends DomainEntity {

	id: string;

	cycles: SubscriptionCycle[];

	@IsUUID()
	@IsNotEmpty()
	account_id: string;

	@IsUUID()
	@IsNotEmpty()
	customer_id: string;

	@IsUUID()
	@IsNotEmpty()
	product_schedule_id: string;

	@IsNotEmpty()
	name: string;

	created_at: Date;
	updated_at: Date;

	@IsUUID()
	@IsNotEmpty()
	merchant_provider_id: string;

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
		customer_id: string,
		product_schedule_id: string,
		name: string,
		created_at: Date,
		updated_at: Date,
		merchant_provider_id: string,
		requires_confirmation: boolean,
		cycles: SubscriptionCycle[]
	) {
		super();
		this.id = id;
		this.account_id = account_id;
		this.customer_id = customer_id;
		this.product_schedule_id = product_schedule_id;
		this.name = name;
		this.created_at = created_at;
		this.updated_at = updated_at;
		this.merchant_provider_id = merchant_provider_id;
		this.requires_confirmation = requires_confirmation;
		this.cycles = cycles;
	}

}

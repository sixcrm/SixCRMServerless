import Cycle from './Cycle';
import EntityValidationError from "../errors/EntityValidationError";
import DomainEntity from "./DomainEntity";
import ProductScheduleValidator from "./validators/ProductScheduleValidator";

export default class ProductSchedule extends DomainEntity {

	id: string;
	cycles: Cycle[];
	account_id: string;
	name: string;
	merchant_provider_group_id: string;
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

	public constructor(obj?:Partial<ProductSchedule>) {
		super();
		Object.assign(this, obj);
	}

}

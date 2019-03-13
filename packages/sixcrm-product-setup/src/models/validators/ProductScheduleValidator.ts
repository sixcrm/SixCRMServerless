import ProductSchedule from "../ProductSchedule";
import EntityValidator from "./EntityValidator";
import EntityValidationError from "../../errors/EntityValidationError";
import Cycle from "../Cycle";

export default class ProductScheduleValidator implements EntityValidator<ProductSchedule> {
	private readonly entity: ProductSchedule;

	constructor(entity: ProductSchedule) {
		this.entity = entity;
	}

	validate(): boolean {
		if (!this.entity.name) {
			this.fail('name');
		}

		if (!this.entity.cycles || !this.entity.cycles.length) {
			this.fail('cycles', this.entity, 'Needs at least one cycle');
		}

		this.entity.cycles.sort((a,b) => a.position - b.position).forEach((cycle, i) => {
			this.validateCycle(cycle);
			this.validatePositionOfNextCycle(cycle, i);
			this.validatePositionOfFirstCycle(cycle, i);
			this.validatePositionOfLastCycle(i, cycle);

		});

		return true;
	}

	private validatePositionOfLastCycle(i, cycle) {
		const expectedPosition = this.entity.cycles.length;
		if (this.isLast(i, this.entity.cycles) && cycle.position !== expectedPosition) {
			this.fail('next_position', cycle, `Last cycle should have position ${expectedPosition} instead of ${cycle.position}`);
		}
	}

	private validatePositionOfFirstCycle(cycle, i) {
		if (cycle.position === 1 && i !== 0) {
			this.fail('next_position', cycle, 'Only first cycle can have position === 1');
		}
	}

	private validatePositionOfNextCycle(cycle, i) {
		const nextCycle = this.entity.nextCycle(cycle);
		if (nextCycle === null && !this.isLast(i, this.entity.cycles)) {
			this.fail('next_position', cycle, 'Only last cycle can have next position === -1');
		}
	}

	private validateCycle(cycle: Cycle) {
		cycle.validate();
	}

	private fail(propertyName, object: any = this.entity, message?: string) {
		throw new EntityValidationError<ProductSchedule>(propertyName, object, message);
	}

	private isLast(index: number, array: any[]) {
		return index === array.length;
	}
}

import Cycle from "../Cycle";
import EntityValidator from "./EntityValidator";
import EntityValidationError from "../../errors/EntityValidationError";

export default class CycleValidator implements EntityValidator<Cycle> {
	private readonly entity: Cycle;

	constructor(entity: Cycle) {
		this.entity = entity;
	}

	validate(): boolean {
		if (!this.entity.cycle_products) {
			throw new EntityValidationError<Cycle>('cycle_products', this.entity);
		}

		if (!this.entity.cycle_products.length) {
			throw new EntityValidationError<Cycle>('cycle_products', this.entity, 'Cycle needs at least one product');
		}

		if (new Set(this.entity.cycle_products.map(cp => cp.product.id)).size < this.entity.cycle_products.length) {
			throw new EntityValidationError<Cycle>('cycle_products', this.entity, 'Products in cycle have to be unique.');
		}

		if (this.entity.position < 1) {
			throw new EntityValidationError<Cycle>('cycle_products', this.entity, 'Position can\'t be zero or negative');
		}

		if (this.entity.next_position < 1) {
			throw new EntityValidationError<Cycle>('cycle_products', this.entity, 'Next position can\'t be zero or negative');
		}

		return true;
	}
}

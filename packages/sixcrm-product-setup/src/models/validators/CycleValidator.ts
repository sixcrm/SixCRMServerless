import Cycle from "../Cycle";
import Product from '../Product';
import EntityValidator from '@6crm/sixcrm-data/lib/EntityValidator';
import EntityValidationError from "@6crm/sixcrm-data/lib/EntityValidationError";

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

		if (
			new Set(
				this.entity.cycle_products.map(cp =>
					(cp.product as Product).id ? (cp.product as Product).id : cp.product
				)
			).size < this.entity.cycle_products.length
		) {
			throw new EntityValidationError<Cycle>('cycle_products', this.entity, 'Products in cycle have to be unique.');
		}

		if (this.entity.position === null || this.entity.position === undefined) {
			throw new EntityValidationError<Cycle>('position', this.entity);
		}

		if (this.entity.position < 1) {
			throw new EntityValidationError<Cycle>('position', this.entity, 'Position can\'t be zero or negative');
		}

		if (this.entity.next_position && this.entity.next_position < 1 && this.entity.next_position !== -1) {
			throw new EntityValidationError<Cycle>('next_position', this.entity, 'Next position can\'t only be positive or -1');
		}

		return true;
	}
}

import * as chai from 'chai';
import LegacyProductSchedule from "../../../src/models/legacy/LegacyProductSchedule";
import ProductSchedule from "../../../src/models/ProductSchedule";
import Cycle from '../../../src/models/Cycle';
import CycleProduct from '../../../src/models/CycleProduct';

const expect = chai.expect;

describe('@6crm/sixcrm-product-setup/models/legacy/LegacyProductSchedule', () => {
	describe('fromProductSchedule', () => {
		it('should transform all required fields, no cycles', () => {
			const id = 'd527ca52-b2fb-4510-a9e1-7b50e55c64a7';
			const accountId = 'acdea20d-384c-46ec-95fd-63fe7bda0845';
			const name = 'Intelligent Plastic Table Schedule';
			const requiresConfirmation = false;
			const created_at = new Date();
			const updated_at = new Date();
			const productSchedule = new ProductSchedule({id: id, account_id: accountId, name: name, requires_confirmation: requiresConfirmation});
			productSchedule.created_at = created_at;
			productSchedule.updated_at = updated_at;

			const legacyProductSchedule = LegacyProductSchedule.fromProductSchedule(productSchedule);

			expect(legacyProductSchedule).to.deep.equal({
				account: accountId,
				id,
				name,
				trial_required: requiresConfirmation,
				schedule: [],
				created_at,
				updated_at
			});
		});

		it('should transform a product schedule with two cycles, no repeat', () => {
			const id = 'd527ca52-b2fb-4510-a9e1-7b50e55c64a7';
			const accountId = 'acdea20d-384c-46ec-95fd-63fe7bda0845';
			const name = 'Intelligent Plastic Table Schedule';
			const requiresConfirmation = false;
			const created_at = new Date();
			const updated_at = new Date();

			const productId = '89de701b-562e-4482-a685-83f539be9843';
			const cycleProduct = new CycleProduct({product: { id: productId }, is_shipping: true, position: 1, quantity: 1});

			const productSchedule = new ProductSchedule({id: id, account_id: accountId, name: name, requires_confirmation: requiresConfirmation});
			productSchedule.created_at = created_at;
			productSchedule.updated_at = updated_at;

			const cycle1 = new Cycle({id: '0e5cc5dc-738d-4c1f-bd87-a27ad7cc5b17', length: { days: 14 }, position: 1, price: 5});
			cycle1.next_position = 2;
			cycle1.cycle_products = [cycleProduct];
			const cycle2 = new Cycle({id: 'ce6dcd14-b54c-46ea-a1cb-0f4ac8f9db8b', length: { days: 30 }, position: 2, price: 30});
			cycle2.cycle_products = [cycleProduct];
			productSchedule.cycles = [cycle1, cycle2];

			const legacyProductSchedule = LegacyProductSchedule.fromProductSchedule(productSchedule);

			expect(legacyProductSchedule).to.deep.equal({
				account: accountId,
				id,
				name,
				trial_required: requiresConfirmation,
				schedule: [{
					end: 14,
					period: 14,
					price: 5,
					product: productId,
					samedayofmonth: false,
					start: 0
				}, {
					end: 44,
					period: 30,
					price: 30,
					product: productId,
					samedayofmonth: false,
					start: 14
				}],
				created_at,
				updated_at
			});
		});

		it('should transform a product schedule with a 30 day repeating cycle', () => {
			const id = 'd527ca52-b2fb-4510-a9e1-7b50e55c64a7';
			const accountId = 'acdea20d-384c-46ec-95fd-63fe7bda0845';
			const name = 'Intelligent Plastic Table Schedule';
			const requiresConfirmation = false;
			const created_at = new Date();
			const updated_at = new Date();

			const productId = '89de701b-562e-4482-a685-83f539be9843';
			const cycleProduct = new CycleProduct({product: { id: productId }, is_shipping: true, position: 1, quantity: 1});

			const productSchedule = new ProductSchedule({id: id, account_id: accountId, name: name, requires_confirmation: requiresConfirmation});
			productSchedule.created_at = created_at;
			productSchedule.updated_at = updated_at;

			const cycle = new Cycle({id: '0e5cc5dc-738d-4c1f-bd87-a27ad7cc5b17', length: { days: 30 }, position: 1, price: 30});
			cycle.next_position = 1;
			cycle.cycle_products = [cycleProduct];
			productSchedule.cycles = [cycle];

			const legacyProductSchedule = LegacyProductSchedule.fromProductSchedule(productSchedule);

			expect(legacyProductSchedule).to.deep.equal({
				account: accountId,
				id,
				name,
				trial_required: requiresConfirmation,
				schedule: [{
					end: null,
					period: 30,
					price: 30,
					product: '89de701b-562e-4482-a685-83f539be9843',
					samedayofmonth: false,
					start: 0
				}],
				created_at,
				updated_at
			});
		});

		it('should transform a product schedule with a monthly repeating cycle', () => {
			const id = 'd527ca52-b2fb-4510-a9e1-7b50e55c64a7';
			const accountId = 'acdea20d-384c-46ec-95fd-63fe7bda0845';
			const name = 'Intelligent Plastic Table Schedule';
			const requiresConfirmation = false;
			const created_at = new Date();
			const updated_at = new Date();

			const productId = '89de701b-562e-4482-a685-83f539be9843';
			const cycleProduct = new CycleProduct({product: { id: productId }, is_shipping: true, position: 1, quantity: 1});

			const productSchedule = new ProductSchedule({id: id, account_id: accountId, name: name, requires_confirmation: requiresConfirmation});
			productSchedule.created_at = created_at;
			productSchedule.updated_at = updated_at;

			const cycle = new Cycle({ id: '0e5cc5dc-738d-4c1f-bd87-a27ad7cc5b17', length: { months: 1 }, position: 1, price:30});
			cycle.next_position = 1;
			cycle.cycle_products = [cycleProduct];
			productSchedule.cycles = [cycle];

			const legacyProductSchedule = LegacyProductSchedule.fromProductSchedule(productSchedule);

			expect(legacyProductSchedule).to.deep.equal({
				account: accountId,
				id,
				name,
				trial_required: requiresConfirmation,
				schedule: [{
					end: null,
					period: 30,
					price: 30,
					product: '89de701b-562e-4482-a685-83f539be9843',
					samedayofmonth: true,
					start: 0
				}],
				created_at,
				updated_at
			});
		});
	});
});

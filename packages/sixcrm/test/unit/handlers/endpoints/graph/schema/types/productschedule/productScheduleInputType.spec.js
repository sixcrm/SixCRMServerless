const chai = require("chai");
const productScheduleInputType = require('../../../../../../../../handlers/endpoints/graph/schema/types/productschedule/productScheduleInputType');

const expect = chai.expect;

describe('handlers/endpoints/graph/schema/types/productschedule/productScheduleInputType', () => {
	describe('toProductScheduleInput', () => {
		it('should transform a current ProductScheduleInput', () => {
			const queryProductScheduleInput = {
				id: 'd527ca52-b2fb-4510-a9e1-7b50e55c64a7',
				name: 'Intelligent Plastic Table Schedule',
				updated_at: '2018-08-19T05:05:02.349Z',
				cycles: [{
					id: '0e5cc5dc-738d-4c1f-bd87-a27ad7cc5b17',
					length: { days: 14 },
					position: 1,
					nextCycle: 2,
					price: 30,
					shippingPrice: 0,
					products: ['89de701b-562e-4482-a685-83f539be9843']
				}, {
					id: '0e5cc5dc-738d-4c1f-bd87-a27ad7cc5b17',
					length: { days: 30 },
					position: 2,
					nextCycle: null,
					price: 30,
					shippingPrice: 0,
					products: ['89de701b-562e-4482-a685-83f539be9843']
				}]
			};

			const productScheduleInput = productScheduleInputType.toProductScheduleInput(queryProductScheduleInput);

			expect(productScheduleInput).to.deep.equal(queryProductScheduleInput);
		});

		it('should transform a ProductScheuldeInput with a two schedules, no repeat', () => {
			const queryProductScheduleInput = {
				id: 'd527ca52-b2fb-4510-a9e1-7b50e55c64a7',
				name: 'Intelligent Plastic Table Schedule',
				updated_at: '2018-08-19T05:05:02.349Z',
				schedule: [{
					end: 14,
					period: 0,
					price: 5,
					product: '89de701b-562e-4482-a685-83f539be9843',
					samedayofmonth: false,
					start: 0
				}, {
					end: 40,
					period: 30,
					price: 30,
					product: '89de701b-562e-4482-a685-83f539be9843',
					samedayofmonth: false,
					start: 10
				}]
			};

			const productScheduleInput = productScheduleInputType.toProductScheduleInput(queryProductScheduleInput);

			expect(productScheduleInput).to.deep.equal({
				id: 'd527ca52-b2fb-4510-a9e1-7b50e55c64a7',
				name: 'Intelligent Plastic Table Schedule',
				updated_at: '2018-08-19T05:05:02.349Z',
				cycles: [{
					length: { days: 14 },
					position: 1,
					nextCycle: 2,
					price: 5,
					shippingPrice: 0,
					products: ['89de701b-562e-4482-a685-83f539be9843']
				}, {
					length: { days: 30 },
					position: 2,
					nextCycle: null,
					price: 30,
					shippingPrice: 0,
					products: ['89de701b-562e-4482-a685-83f539be9843']
				}]
			});
		});

		it('should transform a ProductScheuldeInput with a same day repeating schedule', () => {
			const queryProductScheduleInput = {
				id: 'd527ca52-b2fb-4510-a9e1-7b50e55c64a7',
				name: 'Intelligent Plastic Table Schedule',
				updated_at: '2018-08-19T05:05:02.349Z',
				schedule: [{
					end: null,
					period: 30,
					price: 30,
					product: '89de701b-562e-4482-a685-83f539be9843',
					samedayofmonth: true,
					start: 0
				}]
			};

			const productInput = productScheduleInputType.toProductScheduleInput(queryProductScheduleInput);
			expect(productInput).to.deep.equal({
				id: 'd527ca52-b2fb-4510-a9e1-7b50e55c64a7',
				name: 'Intelligent Plastic Table Schedule',
				updated_at: '2018-08-19T05:05:02.349Z',
				cycles: [{
					length: { months: 1 },
					position: 1,
					nextCycle: 1,
					price: 30,
					shippingPrice: 0,
					products: [
						'89de701b-562e-4482-a685-83f539be9843'
					]
				}]
			});
		});
	});
});
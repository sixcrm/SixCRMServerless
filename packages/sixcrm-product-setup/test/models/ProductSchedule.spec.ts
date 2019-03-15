'use strict';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import chaiExclude = require('chai-exclude');
import ProductSchedule from "../../src/models/ProductSchedule";
import v4 = require("uuid/v4");

chai.use(chaiAsPromised);
chai.use(chaiExclude);
const expect = chai.expect;



describe('@6crm/sixcrm-product-setup/models/ProductSchedule', () => {

	describe('validate', () => {
		it('ProductSchedule requires a name', async () => {
			expect(() => new ProductSchedule('id', 'account', '', false).validate()).to.throw()
		});

		it('ProductSchedule requires a merchant_provider_group_id', async () => {
			const productSchedule = new ProductSchedule('id', 'account', 'Potato Schedule', false);

			expect(() => productSchedule.validate()).to.throw()
		});

		it('ProductSchedule requires cycles', async () => {
			const productSchedule = new ProductSchedule('id', 'account', 'Potato Schedule', false);
			productSchedule.merchant_provider_group_id = v4();

			expect(() => productSchedule.validate()).to.throw()
		});

	});

});

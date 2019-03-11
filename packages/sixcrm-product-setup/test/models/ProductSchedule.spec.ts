'use strict';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import chaiExclude = require('chai-exclude');
import ProductSchedule from "../../src/models/ProductSchedule";

chai.use(chaiAsPromised);
chai.use(chaiExclude);
const expect = chai.expect;



describe('@6crm/sixcrm-product-setup/models/ProductSchedule', () => {

	describe('validate', () => {
		it('ProductSchedule requires a name', async () => {
			expect(() => new ProductSchedule().validate()).to.throw()

		});

	});

});

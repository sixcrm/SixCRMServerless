import { expect } from 'chai';
import 'mocha';
import {ProductId} from "./ProductId";
import {Product} from "./Product";

describe('Product', () => {

	it('should instantiate', () => {
		const product = new Product(new ProductId(), "Whiskey  of the month");
		expect(product.name).to.equal('Whiskey  of the month')
	});

	it('should have the same identity as itself', () => {
		const product = new Product(new ProductId(), "Whiskey  of the month");
		expect(product.sameIdentityAs(product)).to.be.true;
	});

	it('different instances should have different identities', () => {
		const product1 = new Product(new ProductId(), "Whiskey  of the month");
		const product2 = new Product(new ProductId(), "Something else");
		expect(product1.sameIdentityAs(product2)).to.be.false;
	});


});

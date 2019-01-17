import { expect } from 'chai';
import 'mocha';
import {ProductRepositoryDynamoDB} from "./ProductRepositoryDynamoDB";
import {ProductId} from "../../../model/product/ProductId";

describe('ProductRepositoryDynamoDB', () => {

	// This makes live DB calls, should be moved to some non-unit test category.
	xit('retrieves a product', async () => {
		const repository = new ProductRepositoryDynamoDB();
		const product = await repository.getOne(ProductId.of('4d3419f6-526b-4a68-9050-fc3ffcb552b4')); // <- from seed
		expect(product.name).to.equal('Test Product 2');
	});

});

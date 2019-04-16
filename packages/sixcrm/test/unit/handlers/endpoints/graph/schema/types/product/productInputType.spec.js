const chai = require("chai");
const productInputType = require('../../../../../../../../handlers/endpoints/graph/schema/types/product/productInputType');

const expect = chai.expect;

describe('handlers/endpoints/graph/schema/types/product/productInputType', () => {
	describe('toProductInput', () => {
		it('should transform a current ProductInput', () => {
			const queryProductInput = {
				id: 'd527ca52-b2fb-4510-a9e1-7b50e55c64a7',
				name: 'Intelligent Plastic Table',
				description: 'Nisi natus consequatur ipsum quibusdam dolor non molestiae tenetur. Odit sunt illum et. Deserunt suscipit repellat minus rerum laborum molestiae necessitatibus. Aut omnis et. Possimus autem dignissimos quaerat saepe sed reprehenderit quia recusandae. Excepturi esse impedit.',
				sku: 'IPT BLS-12345M',
				price: 996,
				is_shippable: true,
				fulfillment_provider_id: '4f9e0b0e-1968-4882-8827-0d014ae53059',
				image_urls: [
					'https://s3.amazonaws.com/sixcrm-local-account-resources/cb4a1482-1093-4d8e-ad09-fdd4d840b497/user/images/1105b238d971804dac0c942a04ac438297faa17d.jpg'
				],
				updated_at: '2018-08-19T05:05:02.349Z'
			};

			const productInput = productInputType.toProductInput(queryProductInput);
			expect(productInput).to.deep.equal(queryProductInput);
		});

		it('should transform a ProductInput with default_price', () => {
			const queryProductInput = {
				id: 'd527ca52-b2fb-4510-a9e1-7b50e55c64a7',
				name: 'Intelligent Plastic Table',
				description: 'Nisi natus consequatur ipsum quibusdam dolor non molestiae tenetur. Odit sunt illum et. Deserunt suscipit repellat minus rerum laborum molestiae necessitatibus. Aut omnis et. Possimus autem dignissimos quaerat saepe sed reprehenderit quia recusandae. Excepturi esse impedit.',
				sku: 'IPT BLS-12345M',
				default_price: 996,
				is_shippable: true,
				fulfillment_provider_id: '4f9e0b0e-1968-4882-8827-0d014ae53059',
				image_urls: [
					'https://s3.amazonaws.com/sixcrm-local-account-resources/cb4a1482-1093-4d8e-ad09-fdd4d840b497/user/images/1105b238d971804dac0c942a04ac438297faa17d.jpg'
				],
				updated_at: '2018-08-19T05:05:02.349Z'
			};
			const expectedProductInput = {
				...queryProductInput,
				price: 996
			};
			delete expectedProductInput.default_price;

			const productInput = productInputType.toProductInput(queryProductInput);
			expect(productInput).to.deep.equal(expectedProductInput);
		});

		it('should transform a ProductInput with attributes', () => {
			const queryProductInput = {
				id: 'd527ca52-b2fb-4510-a9e1-7b50e55c64a7',
				name: 'Intelligent Plastic Table',
				description: 'Nisi natus consequatur ipsum quibusdam dolor non molestiae tenetur. Odit sunt illum et. Deserunt suscipit repellat minus rerum laborum molestiae necessitatibus. Aut omnis et. Possimus autem dignissimos quaerat saepe sed reprehenderit quia recusandae. Excepturi esse impedit.',
				sku: 'IPT BLS-12345M',
				price: 996,
				is_shippable: true,
				fulfillment_provider_id: '4f9e0b0e-1968-4882-8827-0d014ae53059',
				attributes: {
					images: [{
						path: 'https://s3.amazonaws.com/sixcrm-local-account-resources/cb4a1482-1093-4d8e-ad09-fdd4d840b497/user/images/1105b238d971804dac0c942a04ac438297faa17d.jpg'
					}]
				},
				image_urls: [],
				updated_at: '2018-08-19T05:05:02.349Z'
			};
			const expectedProductInput = {
				...queryProductInput,
				image_urls: [
					'https://s3.amazonaws.com/sixcrm-local-account-resources/cb4a1482-1093-4d8e-ad09-fdd4d840b497/user/images/1105b238d971804dac0c942a04ac438297faa17d.jpg'
				],
			};
			delete expectedProductInput.attributes;

			const productInput = productInputType.toProductInput(queryProductInput);
			expect(productInput).to.deep.equal(expectedProductInput);
		});
	});
});
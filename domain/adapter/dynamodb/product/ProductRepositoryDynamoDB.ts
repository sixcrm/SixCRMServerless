import {ProductRepository} from "../../../model/product/ProductRepository";
import {Product} from "../../../model/product/Product";
import DynamoDB = require("aws-sdk/clients/dynamodb");
import {ProductId} from "../../../model/product/ProductId";
import {ProductDbo} from "./ProductDbo";

const config = require('../config.json');

export class ProductRepositoryDynamoDB implements ProductRepository {

	private dynamodb = new DynamoDB(config);

	async getOne(id: ProductId): Promise<Product> {

		const response = await this.dynamodb.getItem({
			TableName: 'products',
			Key: {
				'id': { S: `${id.value}` }
			}
		}).promise();

		return Promise.resolve(new ProductDbo(response).toEntity());
	}

}

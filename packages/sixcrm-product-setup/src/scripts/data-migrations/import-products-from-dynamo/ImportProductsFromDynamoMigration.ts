import {DynamoProduct} from "../DynamoProduct";
import Product from "../../../models/Product";
import {DataMigration} from "../DataMigration";

export class ImportProductsFromDynamoMigration extends DataMigration {

	async execute(): Promise<void> {
		await super.execute();

		const dynamoProducts: DynamoProduct[] = DynamoProduct.fromArray(await this.getAllFromDynamo('product'));
		const productsToInsert: Product[] = dynamoProducts.map(p => p.toProduct()).filter(p => p.account_id !== '*');

		console.log(`Found ${productsToInsert.length} products in DynamoDB.`);

		for (const product of productsToInsert) {
			await this.saveOneToAurora(product);
		}

		let insertedProductCount = 0;
		for (const product of productsToInsert) {
			insertedProductCount++;
			await this.getOneFromAurora(product.id).catch(e => {
				console.log(`Product ${product.id} not found in Aurora.`);
				insertedProductCount--;
			})
		}

		console.log(`Inserted ${insertedProductCount}/${productsToInsert.length} products to Aurora.`);
	}

}

new ImportProductsFromDynamoMigration().execute();

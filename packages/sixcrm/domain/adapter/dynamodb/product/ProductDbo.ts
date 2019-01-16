import {Product} from "../../../model/product/Product";
import {Dbo} from "../Dbo";
import {ProductId} from "../../../model/product/ProductId";

export class ProductDbo implements Dbo<Product> {
	private id: string;
	private name: string;

	toEntity(): Product {
		return new Product(ProductId.of(this.id), this.name);
	}
	constructor(data: any) {
		this.id = data.Item.id.S;
		this.name = data.Item.name.S;
	}
}

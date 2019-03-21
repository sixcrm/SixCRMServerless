import {
	Entity,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	Check,
	ManyToOne,
	JoinColumn
} from 'typeorm';

import { IsNotEmpty, Min } from "class-validator";
import CycleDbo from "./CycleDbo";
import ProductDbo from "./ProductDbo";
import CycleProduct from "../CycleProduct";
import Product from "../Product";

import { get } from 'lodash';

@Entity({name: "cycle_product"})
@Check(`"quantity" > 0`)
@Check(`"position" >= 0`)
export default class CycleProductDbo {

	@ManyToOne(type => CycleDbo, cycle => cycle.cycle_products, { primary: true })
	@JoinColumn({ name: 'cycle_id' })
	cycle: CycleDbo;

	@ManyToOne(type => ProductDbo, { primary: true })
	@JoinColumn({ name: 'product_id' })
	product: Partial<ProductDbo>;

	@CreateDateColumn()
	created_at: Date;

	@UpdateDateColumn()
	updated_at: Date;

	@Column()
	@IsNotEmpty()
	@Min(1)
	quantity: number;

	@Column()
	@IsNotEmpty()
	is_shipping: boolean;

	@Column()
	@IsNotEmpty()
	@Min(0)
	position: number;

	public constructor(obj?:Partial<CycleProductDbo>) {
		Object.assign(this, obj);
	}

	static fromEntity(entity: CycleProduct): CycleProductDbo {
		return new CycleProductDbo({
			product: ProductDbo.fromEntity(<Product>entity.product),
			position: entity.position,
			is_shipping: entity.is_shipping,
			quantity: entity.quantity,
			updated_at: entity.updated_at,
			created_at: entity.created_at,
			cycle: <CycleDbo>{ id: entity.cycle_id }
		})
	}

	toEntity(): CycleProduct {
		return new CycleProduct({
			cycle_id: get(this, 'cycle.id', null),
			product: this.partialProduct(<ProductDbo>this.product),
			created_at: this.created_at,
			updated_at: this.updated_at,
			quantity: this.quantity,
			is_shipping: this.is_shipping,
			position: this.position
		});
	}

	private partialProduct(dbo: ProductDbo): Partial<Product> {
		return dbo.toEntity();
	}

}

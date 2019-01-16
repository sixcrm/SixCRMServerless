import {Product} from "./Product";
import {Repository} from "../Repository";
import {ProductId} from "./ProductId";

export interface ProductRepository extends Repository<ProductId, Product> {


}

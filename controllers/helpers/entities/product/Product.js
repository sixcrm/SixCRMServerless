
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

module.exports = class ProductHelperController {

	constructor(){

		this.parameter_definition = {};

		this.parameter_validation = {};

		const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');

		this.parameters = new Parameters({validation: this.parameter_validation, definition: this.parameter_definition});

	}

	getDistributionBySKU({products}){

		du.debug('Get Distribution By SKU');

		let grouped_products = arrayutilities.group(products, (product) => {
			return product.sku;
		});

		objectutilities.map(grouped_products, (sku) => {
			grouped_products[sku] = grouped_products[sku].length;
		});

		return grouped_products;

	}

}

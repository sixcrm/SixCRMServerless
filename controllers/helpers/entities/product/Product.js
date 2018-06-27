
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;

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

	getPublicFields(product){

		du.debug('Get Public Fields');

		du.info(product);

		return objectutilities.transcribe(
			{
				'id':'id',
				'name':'name',
				'description':'description',
				'sku':'sku',
				'ship':'ship',
				'attributes':'attributes'
			},
			product,
			{},
			false
		);

	}

}

const _ = require('lodash');
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

	getDefaultImage(product) {

		const image = this.getProductImage(product);

		if (!image) {
			return this.getPublicMissingImagePath();
		}

		return image;
	}

	getProductImage(product) {

		du.debug('Get Default Image');

		du.info(product);

		if (!_(product).has('attributes.images')) {
			return null;
		}

		let filtered_images = product.attributes.images.filter(image => image.default_image);

		if (filtered_images.length) {
			return filtered_images[0].path;
		}

		if (product.attributes.images.length) {
			return product.attributes.images[0].path;
		}

		return null;
	}

	getPublicMissingImagePath() {
		return `https://s3.amazonaws.com/sixcrm-${global.SixCRM.configuration.stage}-account-resources/global/product-default-image.svg`
	}

}

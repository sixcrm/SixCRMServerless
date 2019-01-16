
var _ =  require('lodash');
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;

const PermissionedController = global.SixCRM.routes.include('helpers', 'permission/Permissioned.js');
const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');
const FulfillmentProviderController = global.SixCRM.routes.include('entities', 'FulfillmentProvider.js');
const ProductController = global.SixCRM.routes.include('controllers', 'entities/Product.js');
const RebillController = global.SixCRM.routes.include('controllers', 'entities/Rebill.js');
const TerminalResponse = global.SixCRM.routes.include('providers', 'terminal/Response.js');
const ShippingReceiptController = global.SixCRM.routes.include('entities', 'ShippingReceipt.js');

module.exports = class TerminalUtilitiesController extends PermissionedController  {

	constructor(){

		super();

		this.parameter_definition = {
			fulfill:{
				required: {
					rebill: 'rebill'
				},
				optional:{}
			},
			info:{
				required: {
					shippingreceipt:'shipping_receipt'
				},
				optional:{}
			},
			test:{
				required:{
					fulfillmentproviderid: 'fulfillment_provider_id'
				},
				optional:{}
			}
		};

		this.parameter_validation = {
			rebill: global.SixCRM.routes.path('model', 'entities/rebill.json'),
			transactions: global.SixCRM.routes.path('model', 'entities/components/transactions.json'),
			augmentedtransactionproducts: global.SixCRM.routes.path('model', 'providers/shipping/terminal/augmentedtransactionproducts.json'),
			products: global.SixCRM.routes.path('model', 'entities/components/products.json'),
			shipableproductids: global.SixCRM.routes.path('model', 'providers/shipping/terminal/shipableproductids.json'),
			shipabletransactionproductgroup: global.SixCRM.routes.path('model', 'providers/shipping/terminal/shipabletransactionproductgroup.json'),
			groupedshipabletransactionproducts: global.SixCRM.routes.path('model', 'providers/shipping/terminal/groupedshipabletransactionproducts.json'),
			fulfillmentproviders: global.SixCRM.routes.path('model', 'entities/components/fulfillmentproviders.json'),
			selectedfulfillmentproviderid: global.SixCRM.routes.path('model', 'definitions/uuidv4.json'),
			selectedfulfillmentprovider: global.SixCRM.routes.path('model', 'entities/fulfillmentprovider.json'),
			instantiatedfulfillmentprovider: global.SixCRM.routes.path('model', 'providers/shipping/terminal/instantiatedfulfillmentprovider.json'),
			compoundfulfillmentresponses: global.SixCRM.routes.path('model', 'providers/shipping/terminal/compoundfulfillmentresponses.json'),
			responsecode: global.SixCRM.routes.path('model', 'providers/shipping/terminal/responsecode.json'),
			fulfillmentproviderid: global.SixCRM.routes.path('model', 'definitions/uuidv4.json'),
			fulfillmentprovider: global.SixCRM.routes.path('model', 'entities/fulfillmentprovider.json'),
			vendorresponseclass: global.SixCRM.routes.path('model', 'providers/shipping/terminal/responses/vendorresponseclass.json')
		};

		this.rebillController = new RebillController();
		this.productController = new ProductController();
		this.fulfillmentProviderController = new FulfillmentProviderController();
		this.shippingReceiptController = new ShippingReceiptController();

		const TransactionHelperController = global.SixCRM.routes.include('helpers', 'entities/transaction/Transaction.js');

		this.transactionHelperController = new TransactionHelperController();

		this.parameters = new Parameters({validation: this.parameter_validation, definition: this.parameter_definition});

		this.fulfillmentProviderController.sanitize(false);

	}

	acquireShippingReceipt(){
		let shipping_receipt = this.parameters.get('shippingreceipt');

		return this.shippingReceiptController.get({id: shipping_receipt.id}).then(shipping_receipt => {

			this.parameters.set('shippingreceipt', shipping_receipt);

			return true;

		});

	}

	acquireFulfillmentProvider(){
		let fulfillment_provider_id = this.parameters.get('fulfillmentproviderid');

		return this.fulfillmentProviderController.get({id: fulfillment_provider_id}).then(fulfillment_provider => {

			this.parameters.set('fulfillmentprovider', fulfillment_provider);

			return true;

		});

	}

	acquireRebill(){
		let rebill = this.parameters.get('rebill');

		return this.rebillController.get({id: rebill.id}).then(() => {
			this.parameters.set('rebill', rebill);
			return true;
		});

	}

	acquireTransactions(){
		let rebill = this.parameters.get('rebill');

		return this.rebillController.listTransactions(rebill)
			.then(transactions => this.rebillController.getResult(transactions, 'transactions'))
			.then(transactions => {
				this.parameters.set('transactions', transactions);
				return true;
			});

	}

	acquireProducts(){
		let augmented_transaction_products = this.parameters.get('augmentedtransactionproducts');

		let product_ids = arrayutilities.map(augmented_transaction_products, augmented_transaction_product => {
			return augmented_transaction_product.product.id;
		});

		product_ids = arrayutilities.unique(product_ids);

		return this.productController.getListByAccount({ids: product_ids})
			.then((results) => this.productController.getResult(results, 'products'))
			.then(products => {
				this.parameters.set('products', products);
				return true;
			});

	}

	setAugmentedTransactionProducts(){
		let transactions = this.parameters.get('transactions');

		let augmented_transaction_products = arrayutilities.map(transactions, transaction => {

			let transaction_products = this.transactionHelperController.getTransactionProducts([transaction], false);

			return arrayutilities.map(transaction_products, (transaction_product) => {
				let augmented_transaction_product = objectutilities.clone(transaction_product);

				augmented_transaction_product.transaction = transaction;
				return augmented_transaction_product;
			});

		});

		augmented_transaction_products = arrayutilities.flatten(augmented_transaction_products);

		this.parameters.set('augmentedtransactionproducts', augmented_transaction_products);

		return true;

	}

	getShipableProductIDs(){
		let products = this.parameters.get('products');

		let shipable_products = arrayutilities.filter(products, (product) => {
			return product.ship;
		});

		shipable_products = arrayutilities.unique(shipable_products);

		let shipable_product_ids = arrayutilities.map(shipable_products, shipable_product => {
			return shipable_product.id;
		});

		this.parameters.set('shipableproductids', shipable_product_ids);

		return true;

	}

	createShipableTransactionProductGroup(reship = true){
		let augmented_transaction_products = this.parameters.get('augmentedtransactionproducts');
		let shipable_product_ids = this.parameters.get('shipableproductids');

		let shipable_transaction_product_group = arrayutilities.filter(augmented_transaction_products, augmented_transaction_product => {

			if(_.has(augmented_transaction_product, 'shipping_receipt') && reship == false){
				return false;
			}

			if(_.has(augmented_transaction_product, 'no_ship')){
				return false;
			}

			return _.includes(shipable_product_ids, augmented_transaction_product.product.id);

		});

		this.parameters.set('shipabletransactionproductgroup', shipable_transaction_product_group);

		return true;

	}

	groupShipableTransactionProductGroupByFulfillmentProvider(){
		let shipable_transaction_products = this.parameters.get('shipabletransactionproductgroup');

		let products = this.parameters.get('products');

		let grouped_shipable_transaction_products_object = arrayutilities.group(shipable_transaction_products, (shipable_transaction_product) => {

			let matching_product = arrayutilities.find(products, product => {
				return (product.id == shipable_transaction_product.product.id);
			});

			if(_.has(matching_product, 'fulfillment_provider')){
				return matching_product.fulfillment_provider;
			}

			return null;

		});

		this.parameters.set('groupedshipabletransactionproducts', grouped_shipable_transaction_products_object);

		return true;

	}

	respond(){
		let response_prototype = {
			response_type: this.parameters.get('responsecode')
		};

		let vendor_response_class = this.parameters.get('vendorresponseclass', {fatal: false});

		if(!_.isNull(vendor_response_class) && _.isFunction(vendor_response_class.getParsedResponse)){
			response_prototype.vendor_response = vendor_response_class.getParsedResponse();
		}

		return new TerminalResponse(response_prototype);

	}

}


const _ = require('lodash');
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/lib/util/object-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/lib/util/array-utilities').default;
const { getProductSetupService, LegacyProduct } = require('@6crm/sixcrm-product-setup');
const FulfillmentProviderController = global.SixCRM.routes.include('entities', 'FulfillmentProvider.js');
const Parameters  = global.SixCRM.routes.include('providers', 'Parameters.js');
const RebillController = global.SixCRM.routes.include('controllers', 'entities/Rebill.js');
const SessionController = global.SixCRM.routes.include('entities', 'Session.js');

module.exports = class ShipmentUtilities {

	constructor(){

		this.fulfillmentProviderController = new FulfillmentProviderController();
		this.fulfillmentProviderController.sanitize(false);

		this.rebillController = new RebillController();
		this.sessionController = new SessionController();

		const TransactionHelperController = global.SixCRM.routes.include('helpers', 'entities/transaction/Transaction.js');

		this.transactionHelperController = new TransactionHelperController();

		this.parameter_validation = {
			'products':global.SixCRM.routes.path('model', 'entities/components/products.json'),
			'fulfillmentprovider':global.SixCRM.routes.path('model', 'entities/fulfillmentprovider.json'),
			'fulfillmentproviderid': global.SixCRM.routes.path('model','definitions/uuidv4.json'),
			'rebillid': global.SixCRM.routes.path('model','definitions/uuidv4.json'),
			'rebill':global.SixCRM.routes.path('model', 'entities/rebill.json'),
			'augmentedtransactionproducts': global.SixCRM.routes.path('model', 'providers/shipping/terminal/augmentedtransactionproducts.json'),
			'augmentedtransactionproduct': global.SixCRM.routes.path('model', 'providers/shipping/terminal/augmentedtransactionproduct.json'),
			'hydratedaugmentedtransactionproducts': global.SixCRM.routes.path('model', 'providers/shipping/terminal/hydratedaugmentedtransactionproducts.json'),
			'customer':global.SixCRM.routes.path('model', 'entities/customer.json'),
			'session':global.SixCRM.routes.path('model', 'entities/session.json'),
			'instantiatedfulfillmentprovider': global.SixCRM.routes.path('model', 'helpers/shipment/instantiatedfulfillmentprovider.json'),
			'shippingreceipt':global.SixCRM.routes.path('model', 'entities/shippingreceipt.json')
		};

		this.parameter_definition = {};

		this.parameters = new Parameters({validation: this.parameter_validation, definition: this.parameter_defintion});

	}

	augmentParameters(){
		this.parameters.setParameterValidation({parameter_validation: this.parameter_validation});
		this.parameters.setParameterDefinition({parameter_definition: this.parameter_definition});

		return true;

	}

	instantiateFulfillmentProviderClass(){
		let fulfillment_provider = this.parameters.get('fulfillmentprovider');

		const FulfillmentController = global.SixCRM.routes.include('controllers', 'vendors/fulfillmentproviders/'+fulfillment_provider.provider.name+'/handler.js');

		let fulfillmentController = new FulfillmentController({fulfillment_provider: fulfillment_provider});

		this.parameters.set('instantiatedfulfillmentprovider', fulfillmentController);

		return true;

	}

	//Technical Debt:  Serial Promise Execution necessary
	markTransactionProductsWithShippingReceipt(){
		let shipping_receipt = this.parameters.get('shippingreceipt');
		let augmented_transaction_products = this.parameters.get('augmentedtransactionproducts');

		let update_promises = arrayutilities.map(augmented_transaction_products, augmented_transaction_product => {

			let updated_transaction_product = objectutilities.transcribe({product: 'product', amount: 'amount'}, augmented_transaction_product, {}, true);

			updated_transaction_product = objectutilities.transcribe({no_ship: 'no_ship'}, augmented_transaction_product, updated_transaction_product);
			updated_transaction_product.shipping_receipt = shipping_receipt.id;

			return this.transactionHelperController.updateTransactionProduct({id: augmented_transaction_product.transaction.id, transaction_product: updated_transaction_product}).then(result => {
				//Note:  This is a transaction
				return result;
			});

		});

		//Technical Debt:  This needs to occur serially
		return Promise.all(update_promises).then(() => {
			//Note:  update_promises is a array of transactions
			return true;
		});

	}

	//Needs testing
	issueReceipts(){
		const FulfillmentReceiptController = global.SixCRM.routes.include('providers', 'terminal/Receipt.js');
		let fulfillmentReceiptController = new FulfillmentReceiptController();

		return fulfillmentReceiptController.issueReceipt(this.parameters.getAll()).then(shipping_receipt => {
			this.parameters.set('shippingreceipt', shipping_receipt);
			return true;
		});

	}

	hydrateFulfillmentProvider(){
		let fulfillment_provider_id = this.parameters.get('fulfillmentproviderid');

		return this.fulfillmentProviderController.get({id: fulfillment_provider_id}).then(fulfillment_provider => {

			this.parameters.set('fulfillmentprovider', fulfillment_provider);

			return true;

		});

	}

	hydrateShippingReceiptProperties(){
		let shipping_receipt = this.parameters.get('shippingreceipt');

		this.parameters.set('fulfillmentproviderid', shipping_receipt.fulfillment_provider);

		return this.hydrateFulfillmentProvider();

	}

	async hydrateProducts(){
		let augmented_transaction_products = this.parameters.get('augmentedtransactionproducts');

		let product_ids = arrayutilities.map(augmented_transaction_products, augmented_transaction_product => augmented_transaction_product.product.id);

		product_ids = arrayutilities.unique(product_ids);

		const products = (
			await getProductSetupService().getProductsByIds(product_ids)
		).map(product => LegacyProduct.fromProduct(product));
		this.parameters.set('products', products);
		return true;
	}

	acquireCustomer(){
		return Promise.resolve()
			.then(() => this.acquireRebillFromTransactions())
			.then(() => this.acquireSessionFromRebill())
			.then(() => this.acquireCustomerFromSession());

	}

	acquireRebillFromTransactions(){
		let augmented_transaction_products = this.parameters.get('augmentedtransactionproducts');

		let rebill_ids = arrayutilities.map(augmented_transaction_products, (augmented_transaction_product) => augmented_transaction_product.transaction.rebill);

		rebill_ids = arrayutilities.unique(rebill_ids);

		if(!arrayutilities.nonEmpty(rebill_ids)){
			throw eu.getError('server', 'Unable to establish rebill ID.');
		}

		if(rebill_ids.length > 1){
			throw eu.getError('server', 'Non-distinct rebill ID.');
		}

		this.parameters.set('rebillid', rebill_ids[0]);

		return this.acquireRebill();

	}

	acquireRebill(){
		let rebill_id = this.parameters.get('rebillid');

		return this.rebillController.get({id: rebill_id}).then((rebill) => {

			this.parameters.set('rebill', rebill);

			return true;

		});

	}

	acquireSessionFromRebill(){
		let rebill = this.parameters.get('rebill');

		return this.sessionController.get({id: rebill.parentsession}).then(session => {

			this.parameters.set('session', session);

			return true;

		});

	}

	acquireCustomerFromSession(){
		let session = this.parameters.get('session');

		return this.sessionController.getCustomer(session).then(customer => {

			this.parameters.set('customer', customer);

			return true;

		});

	}

	marryProductsToAugmentedTransactionProducts(){
		let products = this.parameters.get('products');
		let augmented_transaction_products =  this.parameters.get('augmentedtransactionproducts');

		let hydrated_augmented_transaction_products = arrayutilities.map(augmented_transaction_products, (augmented_transaction_product) => {

			let hydrated_product = arrayutilities.find(products, (product) => {
				return (product.id == augmented_transaction_product.product.id);
			});

			augmented_transaction_product.product = hydrated_product;

			return augmented_transaction_product;

		});

		this.parameters.set('hydratedaugmentedtransactionproducts', hydrated_augmented_transaction_products);

		return true;

	}

	validateResponse(){
		if(_.has(this, 'response_validation')){

			let vendor_response = this.parameters.get('vendorresponseclass');

			let parsed_response = vendor_response.getParsedResponse();

			global.SixCRM.validate(parsed_response, this.response_validation);

			return true;

		}

		return false;

	}

	pruneResponse(){
		let vendor_response_class = this.parameters.get('vendorresponseclass');

		vendor_response_class.parameters.unset('vendorresponse');
		vendor_response_class.parameters.unset('response');

		this.parameters.set('vendorresponseclass', vendor_response_class);

		return true;

	}

}

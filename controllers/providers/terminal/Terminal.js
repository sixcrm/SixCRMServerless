

const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;


const FulfillmentController = global.SixCRM.routes.include('helpers', 'shipment/Fulfill.js');
const TestController = global.SixCRM.routes.include('helpers', 'shipment/Test.js');
const InfoController = global.SixCRM.routes.include('helpers', 'shipment/Info.js');

const TerminalUtilities = global.SixCRM.routes.include('providers', 'terminal/TerminalUtilities.js');
const TerminalReceiptController = global.SixCRM.routes.include('providers', 'terminal/Receipt.js');

module.exports = class TerminalController extends TerminalUtilities  {

	constructor(){

		super();

	}

	fulfill(){
		return Promise.resolve(true)
			.then(() => this.parameters.setParameters({argumentation: arguments[0], action:'fulfill'}))
			.then(() => this.acquireRebill())
			.then(() => this.acquireTransactions())
			.then(() => this.setAugmentedTransactionProducts())
			.then(() => this.acquireProducts())
			.then(() => this.getShipableProductIDs())
			.then(() => this.createShipableTransactionProductGroup())
			.then(() => this.groupShipableTransactionProductGroupByFulfillmentProvider())
			.then(() => this.executeFulfill())
			.then(() => this.transformFulfillResponses())
			.then(() => this.respond());

	}

	executeFulfill(){
		let grouped_shipable_transaction_products = this.parameters.get('groupedshipabletransactionproducts');

		let compound_fulfillment_promises = objectutilities.map(grouped_shipable_transaction_products, fulfillment_provider => {

			let fulfillmentController = new FulfillmentController();
			let terminalReceiptController = new TerminalReceiptController();


			return fulfillmentController.execute({
				fulfillment_provider_id: fulfillment_provider,
				augmented_transaction_products: grouped_shipable_transaction_products[fulfillment_provider]
			})
				.then((vendor_response_class) => {

					let augmented_transaction_products = this.convertToAugmentedTransactionProducts(grouped_shipable_transaction_products[fulfillment_provider]);

					return terminalReceiptController.issueReceipt({
						fulfillment_provider_id: fulfillment_provider,
						augmented_transaction_products: augmented_transaction_products,
						fulfillment_provider_reference: vendor_response_class.getParsedResponse().reference_number,
					}).then(shipping_receipt => {
						return {shipping_receipt: shipping_receipt, vendor_response_class: vendor_response_class};
					});

				})

		});

		return arrayutilities.serialPromises(compound_fulfillment_promises)
			.then((results) => {
				this.parameters.set('compoundfulfillmentresponses', results);
				return true;
			});

	}

	convertToAugmentedTransactionProducts(grouped_shipable_transaction_products){

		return arrayutilities.map(grouped_shipable_transaction_products, grouped_shipable_transaction_product => {

			let prototype = objectutilities.transcribe(
				{
					product:'product',
					quantity:'quantity',
					amount:'amount',
					transaction:'transaction'
				},
				grouped_shipable_transaction_product,
				{}
			);

			return objectutilities.transcribe(
				{
					shipping_receipt:'shipping_receipt',
					no_ship:'no_ship'
				},
				grouped_shipable_transaction_product,
				prototype,
				false
			);

		});

	}

	transformFulfillResponses(){
		let compound_fulfillment_responses = this.parameters.get('compoundfulfillmentresponses');

		let response = 'fail';

		let is_success = arrayutilities.every(compound_fulfillment_responses, compound_fulfillment_response => {
			return (compound_fulfillment_response.vendor_response_class.getCode() == 'success');
		});

		if(is_success){
			response = 'success'
		}

		if (!arrayutilities.nonEmpty(compound_fulfillment_responses)) {
			response = 'noaction'
		}

		let is_error = arrayutilities.find(compound_fulfillment_responses, compound_fulfillment_response => {
			return (compound_fulfillment_response.vendor_response_class.getCode() == 'error');
		});

		if(is_error){
			response = 'error';
		}

		this.parameters.set('responsecode', response);

		return true;

	}

	info(){
		return Promise.resolve(true)
			.then(() => this.parameters.setParameters({argumentation: arguments[0], action:'info'}))
			.then(() => this.acquireShippingReceipt())
			.then(() => this.executeInfo())
			.then(() => this.transformInfoResponse())
			.then(() => this.respond());

	}

	executeInfo(){
		let shipping_receipt = this.parameters.get('shippingreceipt');

		let infoController = new InfoController();

		return infoController.execute({shipping_receipt: shipping_receipt}).then(result => {
			this.parameters.set('vendorresponseclass', result);
			return true;
		});

	}

	transformInfoResponse(){
		let vendor_response = this.parameters.get('vendorresponseclass');

		let responsecode = 'fail';

		if(vendor_response.getCode() == 'success' && vendor_response.getMessage() == 'Success'){
			responsecode = 'success';
		}else if(vendor_response.getCode() == 'error'){
			responsecode = 'error';
		}

		this.parameters.set('responsecode', responsecode);

		return true;

	}

	test(){
		return Promise.resolve(true)
			.then(() => this.parameters.setParameters({argumentation: arguments[0], action:'test'}))
			.then(() => this.executeTest())
			.then(() => this.transformTestResponse())
			.then(() => this.respond());

	}

	executeTest(){
		let fulfillment_provider_id = this.parameters.get('fulfillmentproviderid');

		let testController = new TestController();

		return testController.execute({fulfillment_provider_id: fulfillment_provider_id}).then(result => {

			this.parameters.set('vendorresponseclass', result);

			return true;

		});

	}

	transformTestResponse(){
		let vendor_response = this.parameters.get('vendorresponseclass');

		let responsecode = 'fail';

		if(vendor_response.getCode() == 'success' && vendor_response.getMessage() == 'Success'){
			responsecode = 'success';
		}else if(vendor_response.getCode() == 'error'){
			responsecode = 'error';
		}

		this.parameters.set('responsecode', responsecode);

		return true;

	}

}

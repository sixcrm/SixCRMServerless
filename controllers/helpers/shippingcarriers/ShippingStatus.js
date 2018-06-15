
const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;

module.exports = class ShippingStatusController {

	constructor(){

		this.parameter_definition = {
			getStatus:{
				required:{
					shippingreceipt:'shipping_receipt'
				},
				optional:{}
			},
			isDelivered:{
				required:{
					shippingreceipt:'shipping_receipt'
				},
				optional:{}
			}
		};

		this.parameter_validation = {
			'shippingreceipt': global.SixCRM.routes.path('model','entities/shippingreceipt.json'),
			'trackerresponse': global.SixCRM.routes.path('model','providers/tracker/responses/info.json')
		};

		const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');

		this.parameters = new Parameters({validation: this.parameter_validation, definition: this.parameter_definition});

	}

	isDelivered(){

		du.debug('Is Delivered');

		return this.getStatus(arguments[0])
			.then(result => {
				let vendor_response = result.getVendorResponse();

				return (vendor_response.status == 'delivered');
			});

	}

	getStatus(){

		du.debug('Get Status');

		return Promise.resolve()
			.then(() => this.parameters.setParameters({argumentation: arguments[0], action: 'getStatus'}))
			.then(() => this.getCarrierStatus())
			.then(() => this.updateShippingReceiptHistory())
			.then(() => {

				return this.parameters.get('trackerresponse');

			});

	}

	updateShippingReceiptHistory(){

		du.debug('Update Shipping Receipt History');

		let tracker_response = this.parameters.get('trackerresponse').getVendorResponse();
		let shipping_receipt = this.parameters.get('shippingreceipt');

		const ShippingReceiptHelperController = global.SixCRM.routes.include('helpers', 'entities/shippingreceipt/ShippingReceipt.js');
		let shippingReceiptHelperController = new ShippingReceiptHelperController();

		return shippingReceiptHelperController.updateShippingReceipt({
			shipping_receipt: shipping_receipt,
			detail: tracker_response.detail,
			status: tracker_response.status
		}).then(result => {
			this.parameters.set('shippingreceipt', result);
			return true;
		});

	}

	getCarrierStatus(){

		du.debug('Get Carrier Status');

		let shipping_receipt = this.parameters.get('shippingreceipt');

		let TrackerController = global.SixCRM.routes.include('providers','tracker/Tracker.js');
		let trackerController = new TrackerController();

		return trackerController.info({shipping_receipt: shipping_receipt}).then(result => {

			this.parameters.set('trackerresponse', result);

			return true;

		});

	}

}

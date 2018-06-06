
const _ = require('lodash');

const du = global.SixCRM.routes.include('lib','debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
//const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');

const WorkerController = global.SixCRM.routes.include('controllers', 'workers/components/worker.js');

module.exports = class StepFunctionWorkerController extends WorkerController {

	constructor(){

		super();

	}

	validateEvent(event){

		du.debug('Validate Event');

		du.info('Input event: '+JSON.stringify(event));

		if(!_.has(event, 'guid')){
			throw eu.getError('bad_request', 'Expected property "guid" in the event object');
		}

		if(!stringutilities.isUUID(event.guid)){
			throw eu.getError('bad_request', 'Expected property "guid" to be a UUIDV4');
		}

		return event;

	}

	async getShippingReceipt(id, fatal = true){

		du.debug('Get Shipping Receipt');

		if(!_.has(this, 'shippingReceiptController')){
			const ShippingReceiptController = global.SixCRM.routes.include('entities', 'ShippingReceipt.js');
			this.shippingReceiptController = new ShippingReceiptController();
		}

		let shipping_receipt = await this.shippingReceiptController.get({id: id});

		if(_.isNull(shipping_receipt)){
			if(fatal){
				throw eu.getError('server', 'Unable to acquire a shipping receipt that matches '+id);
			}

			du.warning('Unable to acquire a shipping receipt that matches '+id);

		}

		return shipping_receipt;

	}

	async getRebill(id, fatal = true){

		du.debug('Get Rebill');

		if(!_.has(this, 'rebillController')){
			const RebillController = global.SixCRM.routes.include('entities', 'Rebill.js');
			this.rebillController = new RebillController();
		}

		let rebill = await this.rebillController.get({id: id});

		if(_.isNull(rebill)){
			if(fatal){
				throw eu.getError('server', 'Unable to acquire a rebill that matches '+id);
			}

			du.warning('Unable to acquire a rebill that matches '+id);

		}

		return rebill;

	}

	async getSession(id, fatal = true){

		du.debug('Get Session');

		if(!_.has(this, 'sessionController')){
			const SessionController = global.SixCRM.routes.include('entities', 'Session.js');
			this.sessionController = new SessionController();
		}

		let session = await this.sessionController.get({id: id});

		if(_.isNull(session)){
			if(fatal){
				throw eu.getError('server', 'Unable to acquire a session that matches '+id);
			}

			du.warning('Unable to acquire a session that matches '+id);

		}

		return session;

	}

}

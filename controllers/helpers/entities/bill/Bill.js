
const _ = require('lodash');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');
const BillController = global.SixCRM.routes.include('entities', 'Bill.js');

//Technical Debt:  Refactor
module.exports = class BillHelperController {

	constructor(){

		this.parameter_definition = {
			setPayment: {
				required:{
					billid: 'id',
					token: 'token'
				}
			}
		};

		this.parameter_validation = {
			'billid': global.SixCRM.routes.path('model','definitions/uuidv4.json'),
			'token':global.SixCRM.routes.path('model','definitions/stripetoken.json'),
			'bill':global.SixCRM.routes.path('model', 'entities/bill.json')
		};

		this.billController = new BillController();

		this.parameters = new Parameters({validation: this.parameter_validation, definition: this.parameter_definition});

	}

	setPayment(){

		du.debug('Set Payment');

		return Promise.resolve()
			.then(() => this.parameters.setParameters({argumentation: arguments[0], action: 'setPayment'}))
			.then(() => this.acquireBill())
			.then(() => this.validateBill())
		//.then(() => this.acquireTokenProperties())
		//.then(() => this.validateToken())
			.then(() => this.updateBillWithPaymentToken())
			.then(() => {
				return this.parameters.get('bill');
			});

	}

	acquireBill(){

		du.debug('Acquire Bill');

		let bill_id =  this.parameters.get('billid');

		return this.billController.get({id: bill_id}).then(bill => {

			this.parameters.set('bill', bill);

			return true;

		});

	}

	validateBill(){

		du.debug('Validate Bill');

		let bill = this.parameters.get('bill');

		if(this.isPaid(bill)){
			throw eu.getError('bad_request', 'Bill is already paid.');
		}

		return true;

	}

	updateBillWithPaymentToken(){

		du.debug('Update Bill With Payment Token');

		let bill = this.parameters.get('bill');
		let token = this.parameters.get('token');

		bill.paid_result = token;
		bill.paid = true;
		if(_.has(bill, 'overdue')){
			delete bill.overdue;
		}

		return this.billController.updatePaidResult({entity: bill}).then(bill => {

			this.parameters.set('bill', bill);

			return true;

		});

	}

	/*
  acquireTokenProperties(){

    du.debug('Acquire Token Properties');

    let token = this.parameters.get('token');

    return this.stripeHelperController.getTokenProperties({token: token}).then(result => {

      this.parameters.set('tokenproperties', result);

      return true;

    });

  }

  validateToken(){

    du.debug('Validate Token');

    let token_properties =  this.parameters.get('tokenproperties');
    let bill = this.parameters.get('bill');

    make sure that the token amount is equal to the bill amount
    if(this.getBillAmount(bill) !== token_properties.amount){
      throw eu.getError('server', 'Bill total does not equal the token amount.');
    }

    //make sure that the token is unique in our database

    return true;

  }

  */

	isPaid(bill){

		du.debug('Is Paid');

		if(bill.paid == true){
			return true;
		}

		if(_.has(bill, 'paid_result')){
			return true;
		}

		return false;

	}

}

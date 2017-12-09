'use strict'

const _ = require('underscore');
const mockery = require('mockery');
let chai = require('chai');
const uuidV4 = require('uuid/v4');

const expect = chai.expect;
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const mathutilities = global.SixCRM.routes.include('lib', 'math-utilities.js');
const randomutilities = global.SixCRM.routes.include('lib', 'random.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');
const BillHelperController = global.SixCRM.routes.include('helpers','entities/bill/Bill.js');

function getValidToken(){

  //Will need to be updated when stripe tokens are included...
  return randomutilities.createRandomString(20);

}

function getValidBill(){

  let last_month_start = timestamp.getPreviousMonthStart();
  let last_month_end = timestamp.getPreviousMonthEnd();

  let now = timestamp.getISO8601();

  return {
  	id:uuidV4(),
  	account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
  	paid:false,
  	outstanding:false,
  	period_start_at:last_month_start,
  	period_end_at:last_month_end,
  	available_at:last_month_end,
  	detail:[
  		{
  			created_at:now,
  			description:"Some line item charge",
  			amount: 9.99
  		},
  		{
  			created_at:now,
  			description:"Subscription",
  			amount: 30.00
  		},
  		{
  			created_at:now,
  			description:"Transaction Fees",
  			amount: 747.48
  		}
  	],
  	created_at:now,
  	updated_at:now
  };

}

describe('helpers/entities/bill/Bill.js', () => {

  before(() => {

    PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

    mockery.enable({
      useCleanCache: true,
      warnOnReplace: false,
      warnOnUnregistered: false
    });

  });

  afterEach(() => {
      mockery.resetCache();
      mockery.deregisterAll();
  });

  describe('constructor', () => {

    it('successfully calls the constructor', () => {

      let billHelperController = new BillHelperController();

      expect(objectutilities.getClassName(billHelperController)).to.equal('BillHelperController');

    });

  });

  describe('acquireBill', () => {

    it('successfully acquires a bill', () => {

      let bill =  getValidBill();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Bill.js'), {
        get:({id}) => {
          return Promise.resolve(bill);
        }
      });

      PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

      let billHelperController = new BillHelperController();

      billHelperController.parameters.set('billid', bill.id);

      return billHelperController.acquireBill().then(result => {
        expect(result).to.equal(true);
        expect(billHelperController.parameters.store['bill']).to.deep.equal(bill);
      });

    });

  });

  describe('validateBill', () => {

    it('successfully validates a bill (error)', () => {

      let bill = getValidBill();

      bill.paid = true;

      let billHelperController = new BillHelperController();

      billHelperController.parameters.set('bill', bill);

      try{
        billHelperController.validateBill();
      }catch(error){
        expect(error.message).to.equal('[400] Bill is already paid.');
      }

    });

    it('successfully validates a bill', () => {

      let bill = getValidBill();

      let billHelperController = new BillHelperController();

      billHelperController.parameters.set('bill', bill);

      let result = billHelperController.validateBill();

      expect(result).to.equal(true);

    });

  });

  describe('updateBillWithPaymentToken', () => {

    it('successfully updates a bill with a payment token', () => {

      let bill = getValidBill();
      let token = getValidToken();
      let updated_bill = objectutilities.clone(bill);

      updated_bill.paid = true;
      updated_bill.paid_result = token;

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Bill.js'), {
        updatePaidResult:({entity}) => {
          return Promise.resolve(updated_bill);
        }
      });

      let billHelperController = new BillHelperController();

      billHelperController.parameters.set('bill', bill);
      billHelperController.parameters.set('token', token);

      return billHelperController.updateBillWithPaymentToken().then(result => {
        expect(result).to.equal(true);
        expect(billHelperController.parameters.store['bill']).to.deep.equal(updated_bill);
      });

    });

  });

  describe('isPaid', () => {

    it('returns true when bill is paid:true', () => {

      let bill = getValidBill();

      bill.paid = true;

      let billHelperController = new BillHelperController();

      let result = billHelperController.isPaid(bill);

      expect(result).to.equal(true);

    });

    it('returns true when bill has paid_result:token', () => {

      let bill = getValidBill();

      bill.paid_result = getValidToken();

      let billHelperController = new BillHelperController();

      let result = billHelperController.isPaid(bill);

      expect(result).to.equal(true);

    });

    it('returns true when bill is paid:false', () => {

      let bill = getValidBill();

      let billHelperController = new BillHelperController();

      let result = billHelperController.isPaid(bill);

      expect(result).to.equal(false);

    });

  });

  describe('setPayment', () => {

    it('successfully sets a payment token', () => {

      let bill = getValidBill();
      let token = getValidToken();
      let updated_bill = objectutilities.clone(bill);

      updated_bill.paid = true;
      updated_bill.paid_result = token;

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Bill.js'), {
        get:({id}) => {
          return Promise.resolve(bill);
        },
        updatePaidResult:({entity}) => {
          return Promise.resolve(updated_bill);
        }
      });

      let billHelperController = new BillHelperController();

      return billHelperController.setPayment({id: bill.id, token: token}).then(result => {
        expect(result).to.deep.equal(updated_bill);
      });

    });

  });

});

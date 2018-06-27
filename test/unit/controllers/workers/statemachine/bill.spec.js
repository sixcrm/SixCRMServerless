const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');

const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const stringutilities = require('@6crm/sixcrmcore/util/string-utilities').default;
const currencyutilities = require('@6crm/sixcrmcore/util/currency-utilities').default;
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

describe('controllers/workers/statemachine/bill.js', () => {

  before(() => {
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

    it('successfully constructs', () => {

      const BillController = global.SixCRM.routes.include('workers', 'statemachine/bill.js');
      let billController = new BillController();

      expect(objectutilities.getClassName(billController)).to.equal('BillController');

    });

  });

  describe('respond', () => {
    it('successfully response (SUCCESS)', () => {

      let response = {
        getCode: () => {return 'success'}
      }

      const BillController = global.SixCRM.routes.include('workers', 'statemachine/bill.js');
      let billController = new BillController();

      let result = billController.respond(response);
      expect(result).to.equal('SUCCESS');

    });

    it('successfully response (DECLINE)', () => {

      let response = {
        getCode: () => {return 'decline'}
      }

      const BillController = global.SixCRM.routes.include('workers', 'statemachine/bill.js');
      let billController = new BillController();

      let result = billController.respond(response);
      expect(result).to.equal('DECLINE');

    });

    it('successfully response (HARDDECLINE)', () => {

      let response = {
        getCode: () => {return 'harddecline'}
      }

      const BillController = global.SixCRM.routes.include('workers', 'statemachine/bill.js');
      let billController = new BillController();

      let result = billController.respond(response);
      expect(result).to.equal('HARDDECLINE');

    });

    it('Throws an error when the response is not recognized', () => {

      let response = {
        getCode: () => {return 'somegarbage'}
      }

      const BillController = global.SixCRM.routes.include('workers', 'statemachine/bill.js');
      let billController = new BillController();

      try{
        let result = billController.respond(response);
      }catch(error){
        expect(error.message).to.equal('[500] Unexpected response from Register: somegarbage');
      }

    });

  });

  describe('executeBilling', async () => {

    it('successfully returns the register response', async () => {

      let rebill = MockEntities.getValidRebill();

      mockery.registerMock(global.SixCRM.routes.path('providers', 'register/Register.js'), class {
        constructor(){}
        processTransaction({rebill}){
          expect(rebill).to.be.a('object');
          expect(rebill).to.have.property('id');
          return Promise.resolve('Register Response');
        }
      });

      const BillController = global.SixCRM.routes.include('workers', 'statemachine/bill.js');
      let billController = new BillController();

      let result = await billController.executeBilling(rebill);
      expect(result).to.equal('Register Response');

    });

    it('throws an error when Register throws an error', async () => {

      let rebill = MockEntities.getValidRebill();

      mockery.registerMock(global.SixCRM.routes.path('providers', 'register/Register.js'), class {
        constructor(){}
        processTransaction({rebill}){
          expect(rebill).to.be.a('object');
          expect(rebill).to.have.property('id');
          throw new Error("Hey, ima error")
        }
      });

      const BillController = global.SixCRM.routes.include('workers', 'statemachine/bill.js');
      let billController = new BillController();

      try{
        let result = await billController.executeBilling(rebill);
        expect(true).to.equal(false, 'Method should not have executed');
      }catch(error){
        expect(error.message).to.equal('[500] Register Controller returned a error.');
      }
    });
  });

  //Note:  We could embellish on this testing.
  describe('incrementMerchantProviderSummary', async () => {

    it('successfully returns the register response', async () => {

      let transactions = MockEntities.getValidTransactions();
      transactions = transactions.map(transaction => {
        transaction.type = 'sale';
        transaction.result = 'success';
        return transaction;
      });

      let register_response = new class {
        constructor(){
          this.parameters = {
            get: (key) => {
              expect(key).to.equal('transactions');
              return transactions;
            }
          }
        }
      };

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/merchantprovidersummary/MerchantProviderSummary.js'), class{
        constructor(){}
        incrementMerchantProviderSummary({merchant_provider, day, total, type}){
          expect(stringutilities.isUUID(merchant_provider)).to.equal(true);
          expect(stringutilities.isISO8601(day)).to.equal(true);
          expect(currencyutilities.isCurrency(total)).to.equal(true);
          expect(type).to.equal('recurring');
          return Promise.resolve(true);
        }

      });

      const BillController = global.SixCRM.routes.include('workers', 'statemachine/bill.js');
      let billController = new BillController();

      let result = await billController.incrementMerchantProviderSummary(register_response);
      expect(result).to.equal(true);

    });

    it('returns false', async () => {

      let transactions = [];

      let register_response = new class {
        constructor(){
          this.parameters = {
            get: (key) => {
              expect(key).to.equal('transactions');
              return transactions;
            }
          }
        }
      };

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/merchantprovidersummary/MerchantProviderSummary.js'), class{
        constructor(){}
        incrementMerchantProviderSummary({merchant_provider, day, total, type}){
          expect(false).to.equal(true, 'Method should not have executed');
        }
      });

      const BillController = global.SixCRM.routes.include('workers', 'statemachine/bill.js');
      let billController = new BillController();

      let result = await billController.incrementMerchantProviderSummary(register_response);
      expect(result).to.equal(false);

    });

  });

  describe('execute', async () => {

    it('successfully executes (SUCCESS)', async () => {

      let rebill = MockEntities.getValidRebill();

      let transactions = MockEntities.getValidTransactions();
      transactions = transactions.map(transaction => {
        transaction.type = 'sale';
        transaction.result = 'success';
        return transaction;
      });

      let register_response = new class {
        constructor(){
          this.parameters = {
            get: (key) => {
              expect(key).to.equal('transactions');
              return transactions;
            }
          }
        }
        getCode(){
          return 'success'
        }
      };

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
        constructor(){}
        get({id}){
          expect(id).to.be.a('string');
          return Promise.resolve(rebill);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('providers', 'register/Register.js'), class {
        constructor(){}
        processTransaction({rebill}){
          expect(rebill).to.be.a('object');
          expect(rebill).to.have.property('id');
          return Promise.resolve(register_response);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/merchantprovidersummary/MerchantProviderSummary.js'), class{
        constructor(){}
        incrementMerchantProviderSummary({merchant_provider, day, total, type}){
          expect(stringutilities.isUUID(merchant_provider)).to.equal(true);
          expect(stringutilities.isISO8601(day)).to.equal(true);
          expect(currencyutilities.isCurrency(total)).to.equal(true);
          expect(type).to.equal('recurring');
          return Promise.resolve(true);
        }

      });

      const BillController = global.SixCRM.routes.include('workers', 'statemachine/bill.js');
      let billController = new BillController();

      let result = await billController.execute({guid: rebill.id});
      expect(result).to.equal('SUCCESS');

    });

    it('successfully executes (DECLINE)', async () => {

      let rebill = MockEntities.getValidRebill();

      let transactions = MockEntities.getValidTransactions();
      transactions = transactions.map(transaction => {
        transaction.type = 'sale';
        transaction.result = 'decline';
        return transaction;
      });

      let register_response = new class {
        constructor(){
          this.parameters = {
            get: (key) => {
              expect(key).to.equal('transactions');
              return transactions;
            }
          }
        }
        getCode(){
          return 'decline'
        }
      };

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
        constructor(){}
        get({id}){
          expect(id).to.be.a('string');
          return Promise.resolve(rebill);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('providers', 'register/Register.js'), class {
        constructor(){}
        processTransaction({rebill}){
          expect(rebill).to.be.a('object');
          expect(rebill).to.have.property('id');
          return Promise.resolve(register_response);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/merchantprovidersummary/MerchantProviderSummary.js'), class{
        constructor(){}
        incrementMerchantProviderSummary({merchant_provider, day, total, type}){
          expect(stringutilities.isUUID(merchant_provider)).to.equal(true);
          expect(stringutilities.isISO8601(day)).to.equal(true);
          expect(currencyutilities.isCurrency(total)).to.equal(true);
          expect(type).to.equal('recurring');
          return Promise.resolve(true);
        }

      });

      const BillController = global.SixCRM.routes.include('workers', 'statemachine/bill.js');
      let billController = new BillController();

      let result = await billController.execute({guid: rebill.id});
      expect(result).to.equal('DECLINE');

    });

    it('successfully executes (HARDDECLINE)', async () => {

      let rebill = MockEntities.getValidRebill();

      let transactions = MockEntities.getValidTransactions();
      transactions = transactions.map(transaction => {
        transaction.type = 'sale';
        transaction.result = 'harddecline';
        return transaction;
      });

      let register_response = new class {
        constructor(){
          this.parameters = {
            get: (key) => {
              expect(key).to.equal('transactions');
              return transactions;
            }
          }
        }
        getCode(){
          return 'harddecline'
        }
      };

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
        constructor(){}
        get({id}){
          expect(id).to.be.a('string');
          return Promise.resolve(rebill);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('providers', 'register/Register.js'), class {
        constructor(){}
        processTransaction({rebill}){
          expect(rebill).to.be.a('object');
          expect(rebill).to.have.property('id');
          return Promise.resolve(register_response);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/merchantprovidersummary/MerchantProviderSummary.js'), class{
        constructor(){}
        incrementMerchantProviderSummary({merchant_provider, day, total, type}){
          expect(stringutilities.isUUID(merchant_provider)).to.equal(true);
          expect(stringutilities.isISO8601(day)).to.equal(true);
          expect(currencyutilities.isCurrency(total)).to.equal(true);
          expect(type).to.equal('recurring');
          return Promise.resolve(true);
        }

      });

      const BillController = global.SixCRM.routes.include('workers', 'statemachine/bill.js');
      let billController = new BillController();

      let result = await billController.execute({guid: rebill.id});
      expect(result).to.equal('HARDDECLINE');

    });

  });

});

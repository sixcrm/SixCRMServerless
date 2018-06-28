const chai = require("chai");
//const uuidV4 = require('uuid/v4');
const expect = chai.expect;
const mockery = require('mockery');

const timestamp = require('@6crm/sixcrmcore/util/timestamp').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

describe('controllers/workers/statemachine/getFulfillmentRequired.js', () => {

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

      const GetFulfillmentRequiredController = global.SixCRM.routes.include('workers', 'statemachine/getFulfillmentRequired.js');
      let getFulfillmentRequiredController = new GetFulfillmentRequiredController();

      expect(objectutilities.getClassName(getFulfillmentRequiredController)).to.equal('GetFulfillmentRequiredController');

    });

  });

  describe('respond', () => {
    it('returns "SHIP" when argument is false', () => {

      const GetFulfillmentRequiredController = global.SixCRM.routes.include('workers', 'statemachine/getFulfillmentRequired.js');
      let getFulfillmentRequiredController = new GetFulfillmentRequiredController();

      let result = getFulfillmentRequiredController.respond(false);
      expect(result).to.equal('SHIP');

    });

    it('returns "NOSHIP" when argument is true', () => {

      const GetFulfillmentRequiredController = global.SixCRM.routes.include('workers', 'statemachine/getFulfillmentRequired.js');
      let getFulfillmentRequiredController = new GetFulfillmentRequiredController();

      let result = getFulfillmentRequiredController.respond(true);
      expect(result).to.equal('NOSHIP');

    });

  });

  describe('areProductsNoShip', async () => {
    it('returns false when atleast one product is shipable', async () => {

      let products = MockEntities.getValidProducts();
      products[0].ship = true;

      const GetFulfillmentRequiredController = global.SixCRM.routes.include('workers', 'statemachine/getFulfillmentRequired.js');
      let getFulfillmentRequiredController = new GetFulfillmentRequiredController();

      let result = getFulfillmentRequiredController.areProductsNoShip(products);
      expect(result).to.equal(false);

    });

    it('returns true when all products are no-ship', async () => {

      let products = MockEntities.getValidProducts();
      products = products.map(product => {
        product.ship = false;
        return product;
      });

      const GetFulfillmentRequiredController = global.SixCRM.routes.include('workers', 'statemachine/getFulfillmentRequired.js');
      let getFulfillmentRequiredController = new GetFulfillmentRequiredController();

      let result = getFulfillmentRequiredController.areProductsNoShip(products);
      expect(result).to.equal(true);

    });
  });


  describe('getRebillTransactions', async () => {

    //Technical Debt:  Also test the other error conditions
    it('throws an error when transactions are missing', async () => {

      let rebill = MockEntities.getValidRebill();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class{
        constructor(){}
        listTransactions(rebill){
          expect(rebill).to.be.a('object');
          expect(rebill).to.have.property('id');
          return Promise.resolve({transactions: null});
        }
      });

      const GetFulfillmentRequiredController = global.SixCRM.routes.include('workers', 'statemachine/getFulfillmentRequired.js');
      let getFulfillmentRequiredController = new GetFulfillmentRequiredController();

      try{
        await getFulfillmentRequiredController.getRebillTransactions(rebill);
        expect(false).to.equal(true, 'Method should not have executed.');
      }catch(error){
        expect(error.message).to.equal('[500] There are no transactions associated with the rebill.')
      }
    });

    it('successfully returns transactions', async () => {

      let transactions = MockEntities.getValidTransactions();
      let rebill = MockEntities.getValidRebill();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class{
        constructor(){}
        listTransactions(rebill){
          expect(rebill).to.be.a('object');
          expect(rebill).to.have.property('id');
          return Promise.resolve({transactions: transactions});
        }
      });

      const GetFulfillmentRequiredController = global.SixCRM.routes.include('workers', 'statemachine/getFulfillmentRequired.js');
      let getFulfillmentRequiredController = new GetFulfillmentRequiredController();

      let result = await getFulfillmentRequiredController.getRebillTransactions(rebill);
      expect(result).to.deep.equal(transactions);

    });

  });

  describe('getTransactionProducts', async () => {
    it('successfully gets the transaction products', async () => {

      let products = MockEntities.getValidProducts();
      let transactions = MockEntities.getValidTransactions();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Transaction.js'), class{
        constructor(){}
        getProducts(transaction){
          expect(transaction).to.be.a('object');
          expect(transaction).to.have.property('id');
          return Promise.resolve(products);
        }
      });

      const GetFulfillmentRequiredController = global.SixCRM.routes.include('workers', 'statemachine/getFulfillmentRequired.js');
      let getFulfillmentRequiredController = new GetFulfillmentRequiredController();

      let result = await getFulfillmentRequiredController.getTransactionProducts(transactions);
      expect(result).to.be.a('array');
      expect(result.length).to.equal(products.length);

    });

    it('throws an error on no products', async () => {

      let products = MockEntities.getValidProducts();
      let transactions = MockEntities.getValidTransactions();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Transaction.js'), class{
        constructor(){}
        getProducts(transaction){
          expect(transaction).to.be.a('object');
          expect(transaction).to.have.property('id');
          return Promise.resolve([]);
        }
      });

      const GetFulfillmentRequiredController = global.SixCRM.routes.include('workers', 'statemachine/getFulfillmentRequired.js');
      let getFulfillmentRequiredController = new GetFulfillmentRequiredController();

      try{
        await getFulfillmentRequiredController.getTransactionProducts(transactions);
        expect(false).to.equal(true, 'Method should not have executed.');
      }catch(error){
        expect(error.message).to.equal('[500] There are no products associated with the transactions.');
      }

    });

    it('throws an error on unexpected responses (null promise response)', async () => {

      let products = MockEntities.getValidProducts();
      let transactions = MockEntities.getValidTransactions();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Transaction.js'), class{
        constructor(){}
        getProducts(transaction){
          expect(transaction).to.be.a('object');
          expect(transaction).to.have.property('id');
          return Promise.resolve(null);
        }
      });

      const GetFulfillmentRequiredController = global.SixCRM.routes.include('workers', 'statemachine/getFulfillmentRequired.js');
      let getFulfillmentRequiredController = new GetFulfillmentRequiredController();

      try{
        await getFulfillmentRequiredController.getTransactionProducts(transactions);
        expect(false).to.equal(true, 'Method should not have executed.');
      }catch(error){
        expect(error.message).to.have.string('[500] Unexpected result when retrieving transaction products');
      }

    });

    it('throws an error on unexpected responses (unexpected index in array)', async () => {

      let products = MockEntities.getValidProducts();
      let transactions = MockEntities.getValidTransactions();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Transaction.js'), class{
        constructor(){}
        getProducts(transaction){
          expect(transaction).to.be.a('object');
          expect(transaction).to.have.property('id');
          return Promise.resolve([null]);
        }
      });

      const GetFulfillmentRequiredController = global.SixCRM.routes.include('workers', 'statemachine/getFulfillmentRequired.js');
      let getFulfillmentRequiredController = new GetFulfillmentRequiredController();

      try{
        await getFulfillmentRequiredController.getTransactionProducts(transactions);
        expect(false).to.equal(true, 'Method should not have executed.');
      }catch(error){
        expect(error.message).to.have.string('[500] Unexpected result in array when retrieving transaction products');
      }

    });

  });

  describe('execute', async () => {
    it('successfully returns "SHIP"', async () => {

      let rebill = MockEntities.getValidRebill();
      let transactions = MockEntities.getValidTransactions();
      let products = MockEntities.getValidProducts();
      products[0].ship = true;

      const event = {guid: rebill.id};

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class{
        constructor(){}
        get({id}){
          expect(id).to.be.a('string');
          return Promise.resolve(rebill);
        }
        listTransactions(rebill){
          expect(rebill).to.be.a('object');
          expect(rebill).to.have.property('id');
          return Promise.resolve({transactions: transactions});
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Transaction.js'), class{
        constructor(){}
        getProducts(transaction){
          expect(transaction).to.be.a('object');
          expect(transaction).to.have.property('id');
          return Promise.resolve(products);
        }
      });

      const GetFulfillmentRequiredController = global.SixCRM.routes.include('workers', 'statemachine/getFulfillmentRequired.js');
      let getFulfillmentRequiredController = new GetFulfillmentRequiredController();

      let result = await getFulfillmentRequiredController.execute(event);
      expect(result).to.equal('SHIP');

    });

    it('successfully returns "NOSHIP"', async () => {

      let rebill = MockEntities.getValidRebill();
      let transactions = MockEntities.getValidTransactions();
      let products = MockEntities.getValidProducts();
      products = products.map(product => {
        product.ship = false;
        return product;
      })

      const event = {guid: rebill.id};

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class{
        constructor(){}
        get({id}){
          expect(id).to.be.a('string');
          return Promise.resolve(rebill);
        }
        listTransactions(rebill){
          expect(rebill).to.be.a('object');
          expect(rebill).to.have.property('id');
          return Promise.resolve({transactions: transactions});
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Transaction.js'), class{
        constructor(){}
        getProducts(transaction){
          expect(transaction).to.be.a('object');
          expect(transaction).to.have.property('id');
          return Promise.resolve(products);
        }
      });

      const GetFulfillmentRequiredController = global.SixCRM.routes.include('workers', 'statemachine/getFulfillmentRequired.js');
      let getFulfillmentRequiredController = new GetFulfillmentRequiredController();

      let result = await getFulfillmentRequiredController.execute(event);
      expect(result).to.equal('NOSHIP');

    });
  });

});

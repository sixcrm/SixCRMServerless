'use strict'
const _ = require('underscore');
const chai = require("chai");
const uuidV4 = require('uuid/v4');
const expect = chai.expect;
const mockery = require('mockery');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const randomutilities = global.SixCRM.routes.include('lib', 'random.js');
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');

function getValidMessage(){

  return {
    MessageId:"someMessageID",
    ReceiptHandle:"SomeReceiptHandle",
    Body: JSON.stringify({id:"00c103b4-670a-439e-98d4-5a2834bb5f00"}),
    MD5OfBody:"SomeMD5"
  };

}

function getValidProducts(){

  return [
    {
      id:uuidV4(),
  		name:randomutilities.createRandomString(20),
  		sku:randomutilities.createRandomString(20),
  		ship:true,
  		shipping_delay:300,
  		fulfillment_provider:uuidV4(),
  		default_price:34.99,
  		account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
  		created_at:timestamp.getISO8601(),
  		updated_at:timestamp.getISO8601()
    },
    {
      id:uuidV4(),
  		name:randomutilities.createRandomString(20),
  		sku:randomutilities.createRandomString(20),
  		ship:true,
  		shipping_delay:300,
  		fulfillment_provider:uuidV4(),
  		default_price:34.99,
  		account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
  		created_at:timestamp.getISO8601(),
  		updated_at:timestamp.getISO8601()
    }
  ];

}

function getValidProductsForArchive(){

    return [
        {
            product:{
                id:uuidV4(),
                name:randomutilities.createRandomString(20),
                sku:randomutilities.createRandomString(20),
                ship:true,
                shipping_delay:300,
                fulfillment_provider:uuidV4(),
                default_price:34.99,
                account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
                created_at:timestamp.getISO8601(),
                updated_at:timestamp.getISO8601()
            }
        },
        {
            product:{
                id:uuidV4(),
                name:randomutilities.createRandomString(20),
                sku:randomutilities.createRandomString(20),
                ship:true,
                shipping_delay:300,
                fulfillment_provider:uuidV4(),
                default_price:34.99,
                account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
                created_at:timestamp.getISO8601(),
                updated_at:timestamp.getISO8601()
            }
        }
    ];

}

function getValidRebill(){

  return {
    id: uuidV4(),
    bill_at: timestamp.getISO8601(),
    account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
    parentsession: uuidV4(),
    product_schedules: [uuidV4()],
    amount: 79.99,
    created_at:timestamp.getISO8601(),
    updated_at:timestamp.getISO8601()
  };

}

function getValidTransactions(){

  return [
    {
      amount: 34.99,
      id: "d376f777-3e0b-43f7-a5eb-98ee109fa2c5",
      alias:"T56S2HJ922",
      account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
      rebill: "55c103b4-670a-439e-98d4-5a2834bb5fc3",
      processor_response: "{\"message\":\"Success\",\"result\":{\"response\":\"1\",\"responsetext\":\"SUCCESS\",\"authcode\":\"123456\",\"transactionid\":\"3448894418\",\"avsresponse\":\"N\",\"cvvresponse\":\"\",\"orderid\":\"\",\"type\":\"sale\",\"response_code\":\"100\"}}",
      merchant_provider: "6c40761d-8919-4ad6-884d-6a46a776cfb9",
      products:[{
        product:"be992cea-e4be-4d3e-9afa-8e020340ed16",
        amount:34.99
      }],
      type:"reverse",
      result:"success",
      created_at:"2017-04-06T18:40:41.405Z",
      updated_at:"2017-04-06T18:41:12.521Z"
    },
    {
      amount: 13.22,
      id: "d376f777-3e0b-43f7-a5eb-98ee109fa2c5",
      alias:"T56S2HJ922",
      account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
      rebill: "55c103b4-670a-439e-98d4-5a2834bb5fc3",
      processor_response: "{\"message\":\"Success\",\"result\":{\"response\":\"1\",\"responsetext\":\"SUCCESS\",\"authcode\":\"123456\",\"transactionid\":\"3448894418\",\"avsresponse\":\"N\",\"cvvresponse\":\"\",\"orderid\":\"\",\"type\":\"sale\",\"response_code\":\"100\"}}",
      merchant_provider: "6c40761d-8919-4ad6-884d-6a46a776cfb9",
      products:[{
        product:"be992cea-e4be-4d3e-9afa-8e020340ed16",
        amount:34.99
      }],
      type:"refund",
      result:"success",
      created_at:"2017-04-06T18:40:41.405Z",
      updated_at:"2017-04-06T18:41:12.521Z"
    }
  ];

}

describe('controllers/workers/archive', function () {

    before(() => {
        mockery.enable({
            useCleanCache: true,
            warnOnReplace: false,
            warnOnUnregistered: false
        });
    });

    afterEach(() => {
        mockery.resetCache();
    });

    after(() => {
        mockery.deregisterAll();
    });

    describe('confirmSecondAttempt', () => {

      it('determines second attempt', () => {

        let rebill = getValidRebill();

        const ArchiveController = global.SixCRM.routes.include('controllers', 'workers/archive.js');
        let archiveController = new ArchiveController();

        archiveController.parameters.set('rebill', rebill);

        return archiveController.confirmSecondAttempt().then(result => {
          expect(result).to.equal(true);
          expect(archiveController.parameters.store['responsecode']).to.equal('noaction');
        });

      });

      it('determines second attempt', () => {

        let rebill = getValidRebill();

        rebill.second_attempt = true;

        const ArchiveController = global.SixCRM.routes.include('controllers', 'workers/archive.js');
        let archiveController = new ArchiveController();

        archiveController.parameters.set('rebill', rebill);

        return archiveController.confirmSecondAttempt().then(result => {
          expect(result).to.equal(true);
          expect(archiveController.parameters.store['responsecode']).to.equal('success');
        });

      });

    });

    describe('getRebillTransactions', () => {

      it('acquires rebill transactions', () => {

        let transactions = getValidTransactions();
        let rebill = getValidRebill();

        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), {
          listTransactions: (rebill) => {
              return Promise.resolve({ transactions: transactions });
          }
        });

        const ArchiveController = global.SixCRM.routes.include('controllers', 'workers/archive.js');
        let archiveController = new ArchiveController();

        archiveController.parameters.set('rebill', rebill);

        return archiveController.getRebillTransactions().then(result => {
          expect(result).to.equal(true);
          expect(archiveController.parameters.store['transactions']).to.deep.equal(transactions);
        });

      });

    });

    describe('getTransactionProducts', () => {

      it('acquires transaction products', () => {

        let transactions = getValidTransactions();
        let products = getValidProductsForArchive();

        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Transaction.js'), {
          getProducts: (transaction) => {
            return Promise.resolve(products);
          }
        });

        const ArchiveController = global.SixCRM.routes.include('controllers', 'workers/archive.js');
        let archiveController = new ArchiveController();

        archiveController.parameters.set('transactions', transactions);

        return archiveController.getTransactionProducts().then(result => {
          expect(result).to.equal(true);
          expect(archiveController.parameters.store['products'][0]).to.deep.equal(products[0].product);
        });

      });

    });

    describe('getTransactionProducts', () => {

      it('acquires transaction products', () => {

        let archive_filter = 'all';

        process.env.archivefilter = archive_filter;
        const ArchiveController = global.SixCRM.routes.include('controllers', 'workers/archive.js');
        let archiveController = new ArchiveController();
        let result = archiveController.setArchiveFilter();

        expect(result).to.equal(true);
        expect(archiveController.parameters.store['archivefilter']).to.equal(archive_filter);

      });

    });

    describe('areProductsNoShip', () => {

      it('Are products no ship (false)', () => {

        let products = getValidProducts();

        const ArchiveController = global.SixCRM.routes.include('controllers', 'workers/archive.js');
        let archiveController = new ArchiveController();

        archiveController.parameters.set('products', products);

        let result = archiveController.areProductsNoShip();

        expect(result).to.equal(false);

      });

      it('Are products no ship (true)', () => {

        let products = getValidProducts();

        products[0].ship = false;
        products[1].ship = false;

        const ArchiveController = global.SixCRM.routes.include('controllers', 'workers/archive.js');
        let archiveController = new ArchiveController();

        archiveController.parameters.set('products', products);

        let result = archiveController.areProductsNoShip();

        expect(result).to.equal(true);

      });

    });

    describe('confirmNoShip', () => {

      it('some ship', () => {

        let rebill = getValidRebill();
        let products = getValidProductsForArchive();
        let transactions = getValidTransactions();

        products[0].product.ship = true;
        products[1].product.ship = false;

        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Transaction.js'), {
          getProducts: (transaction) => {
            return Promise.resolve(products);
          }
        });

        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), {
          listTransactions: (rebill) => {
              return Promise.resolve({ transactions: transactions });
          }
        });

        const ArchiveController = global.SixCRM.routes.include('controllers', 'workers/archive.js');
        let archiveController = new ArchiveController();

        archiveController.parameters.set('rebill', rebill);

        return archiveController.confirmNoShip().then(result => {
          expect(result).to.equal(true);
          expect(archiveController.parameters.store['responsecode']).to.equal('noaction');
        });

      });

      it('all no ship', () => {

        let rebill = getValidRebill();
        let products = getValidProductsForArchive();
        let transactions = getValidTransactions();

        products[0].product.ship = false;
        products[1].product.ship = false;

        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Transaction.js'), {
          getProducts: (transaction) => {
            return Promise.resolve(products);
          }
        });

        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), {
          listTransactions: (rebill) => {
              return Promise.resolve({ transactions: transactions });
          }
        });

        const ArchiveController = global.SixCRM.routes.include('controllers', 'workers/archive.js');
        let archiveController = new ArchiveController();

        archiveController.parameters.set('rebill', rebill);

        return archiveController.confirmNoShip().then(result => {
          expect(result).to.equal(true);
          expect(archiveController.parameters.store['responsecode']).to.equal('success');
        });

      });

    });

    describe('archive', () => {

      it('Successfully runs archive (all)', () => {

        let archivefilter = 'all';

        const ArchiveController = global.SixCRM.routes.include('controllers', 'workers/archive.js');
        let archiveController = new ArchiveController();

        archiveController.parameters.set('archivefilter', archivefilter);

        return archiveController.archive().then(result => {
          expect(result).to.equal(true);
          expect(archiveController.parameters.store['responsecode']).to.equal('success');
        });
      });

      it('Successfully runs archive (noship, success)', () => {

        let archivefilter = 'noship';

        let rebill = getValidRebill();
        let products = getValidProductsForArchive();
        let transactions = getValidTransactions();

        products[0].product.ship = false;
        products[1].product.ship = false;

        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Transaction.js'), {
          getProducts: (transaction) => {
            return Promise.resolve(products);
          }
        });

        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), {
          listTransactions: (rebill) => {
              return Promise.resolve({ transactions: transactions });
          }
        });

        const ArchiveController = global.SixCRM.routes.include('controllers', 'workers/archive.js');
        let archiveController = new ArchiveController();

        archiveController.parameters.set('archivefilter', archivefilter);
        archiveController.parameters.set('rebill', rebill);

        return archiveController.archive().then(result => {
          expect(result).to.equal(true);
          expect(archiveController.parameters.store['responsecode']).to.equal('success');
        });
      });

      it('Successfully runs archive (noship, noaction)', () => {

        let archivefilter = 'noship';

        let rebill = getValidRebill();
        let products = getValidProductsForArchive();
        let transactions = getValidTransactions();

        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Transaction.js'), {
          getProducts: (transaction) => {
            return Promise.resolve(products);
          }
        });

        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), {
          listTransactions: (rebill) => {
              return Promise.resolve({ transactions: transactions });
          }
        });

        const ArchiveController = global.SixCRM.routes.include('controllers', 'workers/archive.js');
        let archiveController = new ArchiveController();

        archiveController.parameters.set('archivefilter', archivefilter);
        archiveController.parameters.set('rebill', rebill);

        return archiveController.archive().then(result => {
          expect(result).to.equal(true);
          expect(archiveController.parameters.store['responsecode']).to.equal('noaction');
        });
      });

      it('Successfully runs archive (twoattempts, noaction)', () => {

        let archivefilter = 'twoattempts';
        let rebill = getValidRebill();

        const ArchiveController = global.SixCRM.routes.include('controllers', 'workers/archive.js');
        let archiveController = new ArchiveController();

        archiveController.parameters.set('archivefilter', archivefilter);
        archiveController.parameters.set('rebill', rebill);

        return archiveController.archive().then(result => {
          expect(result).to.equal(true);
          expect(archiveController.parameters.store['responsecode']).to.equal('noaction');
        });
      });

      it('Successfully runs archive (twoattempts, noaction)', () => {

        let archivefilter = 'twoattempts';
        let rebill = getValidRebill();

        rebill.second_attempt = true;

        const ArchiveController = global.SixCRM.routes.include('controllers', 'workers/archive.js');
        let archiveController = new ArchiveController();

        archiveController.parameters.set('archivefilter', archivefilter);
        archiveController.parameters.set('rebill', rebill);

        return archiveController.archive().then(result => {
          expect(result).to.equal(true);
          expect(archiveController.parameters.store['responsecode']).to.equal('success');
        });
      });

    });

    describe('respond', () => {

      it('Successfully responds (success)', () => {

        const ArchiveController = global.SixCRM.routes.include('controllers', 'workers/archive.js');
        let archiveController = new ArchiveController();

        archiveController.parameters.set('responsecode', 'success');

        let result = archiveController.respond();

        expect(objectutilities.getClassName(result)).to.equal('WorkerResponse');
        expect(result.getCode()).to.equal('success');

      });

      it('Successfully responds (success)', () => {

        const ArchiveController = global.SixCRM.routes.include('controllers', 'workers/archive.js');
        let archiveController = new ArchiveController();

        archiveController.parameters.set('responsecode', 'noaction');

        let result = archiveController.respond();

        expect(objectutilities.getClassName(result)).to.equal('WorkerResponse');
        expect(result.getCode()).to.equal('noaction');

      });

      it('Successfully responds (success)', () => {

        const ArchiveController = global.SixCRM.routes.include('controllers', 'workers/archive.js');
        let archiveController = new ArchiveController();

        archiveController.parameters.set('responsecode', 'error');

        let result = archiveController.respond();

        expect(objectutilities.getClassName(result)).to.equal('WorkerResponse');
        expect(result.getCode()).to.equal('error');

      });

    });

    describe('execute', () => {

      it('Successfully executes (noship, noaction)', () => {

        let archive_filter = 'noship';

        process.env.archivefilter = archive_filter

        let message = getValidMessage();
        let rebill = getValidRebill();
        let products = getValidProductsForArchive();
        let transactions = getValidTransactions();

        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Transaction.js'), {
          getProducts: (transaction) => {
            return Promise.resolve(products);
          }
        });

        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), {
          listTransactions: (rebill) => {
              return Promise.resolve({ transactions: transactions });
          },
          get: ({id}) => {
            return Promise.resolve(rebill);
          }
        });

        const ArchiveController = global.SixCRM.routes.include('controllers', 'workers/archive.js');
        let archiveController = new ArchiveController();

        return archiveController.execute(message).then(result => {
          expect(objectutilities.getClassName(result)).to.equal('WorkerResponse');
          expect(archiveController.parameters.store['archivefilter']).to.equal(archive_filter);
          expect(result.getCode()).to.equal('noaction');
        });
      });

      it('Successfully executes (noship, success)', () => {

        let archive_filter = 'noship';

        process.env.archivefilter = archive_filter

        let message = getValidMessage();
        let rebill = getValidRebill();
        let products = getValidProductsForArchive();

        products[0].product.ship = false;
        products[1].product.ship = false;
        let transactions = getValidTransactions();

        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Transaction.js'), {
          getProducts: (transaction) => {
            return Promise.resolve(products);
          }
        });

        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), {
          listTransactions: (rebill) => {
              return Promise.resolve({ transactions: transactions });
          },
          get: ({id}) => {
            return Promise.resolve(rebill);
          }
        });

        const ArchiveController = global.SixCRM.routes.include('controllers', 'workers/archive.js');
        let archiveController = new ArchiveController();

        return archiveController.execute(message).then(result => {
          expect(objectutilities.getClassName(result)).to.equal('WorkerResponse');
          expect(archiveController.parameters.store['archivefilter']).to.equal(archive_filter);
          expect(result.getCode()).to.equal('success');
        });
      });

      it('Successfully executes (all, success)', () => {

        let archive_filter = 'all';

        process.env.archivefilter = archive_filter;

        let message = getValidMessage();
        let rebill = getValidRebill();
        let products = getValidProductsForArchive();
        let transactions = getValidTransactions();

        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Transaction.js'), {
          getProducts: (transaction) => {
            return Promise.resolve(products);
          }
        });

        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), {
          listTransactions: (rebill) => {
              return Promise.resolve({ transactions: transactions });
          },
          get: ({id}) => {
            return Promise.resolve(rebill);
          }
        });

        const ArchiveController = global.SixCRM.routes.include('controllers', 'workers/archive.js');
        let archiveController = new ArchiveController();

        return archiveController.execute(message).then(result => {
          expect(objectutilities.getClassName(result)).to.equal('WorkerResponse');
            expect(archiveController.parameters.store['archivefilter']).to.equal(archive_filter);
          expect(result.getCode()).to.equal('success');
        });

      });

      it('Successfully executes (twoattempts, success)', () => {

        let archive_filter = 'twoattempts';

        process.env.archivefilter = archive_filter;

        let message = getValidMessage();
        let rebill = getValidRebill();

        rebill.second_attempt = true;
        let products = getValidProductsForArchive();
        let transactions = getValidTransactions();

        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Transaction.js'), {
          getProducts: (transaction) => {
            return Promise.resolve(products);
          }
        });

        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), {
          listTransactions: (rebill) => {
              return Promise.resolve({ transactions: transactions });
          },
          get: ({id}) => {
            return Promise.resolve(rebill);
          }
        });

        const ArchiveController = global.SixCRM.routes.include('controllers', 'workers/archive.js');
        let archiveController = new ArchiveController();

        return archiveController.execute(message).then(result => {
          expect(objectutilities.getClassName(result)).to.equal('WorkerResponse');
            expect(archiveController.parameters.store['archivefilter']).to.equal(archive_filter);
          expect(result.getCode()).to.equal('success');
        });

      });

      it('Successfully executes (twoattempts, noaction)', () => {

        let archive_filter = 'twoattempts';

        process.env.archivefilter = archive_filter;

        let message = getValidMessage();
        let rebill = getValidRebill();
        let products = getValidProductsForArchive();
        let transactions = getValidTransactions();

        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Transaction.js'), {
          getProducts: (transaction) => {
            return Promise.resolve(products);
          }
        });

        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), {
          listTransactions: (rebill) => {
              return Promise.resolve({ transactions: transactions });
          },
          get: ({id}) => {
            return Promise.resolve(rebill);
          }
        });

        const ArchiveController = global.SixCRM.routes.include('controllers', 'workers/archive.js');
        let archiveController = new ArchiveController();

        return archiveController.execute(message).then(result => {
          expect(objectutilities.getClassName(result)).to.equal('WorkerResponse');
            expect(archiveController.parameters.store['archivefilter']).to.equal(archive_filter);
          expect(result.getCode()).to.equal('noaction');
        });

      });

      it('Successfully executes (null, success)', () => {

        delete process.env.archivefilter;

        let message = getValidMessage();
        let rebill = getValidRebill();
        let products = getValidProductsForArchive();
        let transactions = getValidTransactions();

        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Transaction.js'), {
          getProducts: (transaction) => {
            return Promise.resolve(products);
          }
        });

        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), {
          listTransactions: (rebill) => {
              return Promise.resolve({ transactions: transactions });
          },
          get: ({id}) => {
            return Promise.resolve(rebill);
          }
        });

        const ArchiveController = global.SixCRM.routes.include('controllers', 'workers/archive.js');
        let archiveController = new ArchiveController();

        return archiveController.execute(message).then(result => {
          expect(objectutilities.getClassName(result)).to.equal('WorkerResponse');
            expect(archiveController.parameters.store['archivefilter']).to.not.be.defined;
          expect(result.getCode()).to.equal('success');
        });

      });

    });

});

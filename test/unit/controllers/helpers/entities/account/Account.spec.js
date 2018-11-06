const mockery = require('mockery');
let chai = require('chai');
const expect = chai.expect;

const timestamp = require('@6crm/sixcrmcore/util/timestamp').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
//const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;

const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

describe('constrollers/helpers/entities/account/Account.js', () => {

  beforeEach(() => {
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

	after(() => {
		mockery.disable();
	});

  describe('constructor', () => {
    it('successfully constructs', () => {

      const AccountHelperController = global.SixCRM.routes.include('helpers', 'entities/account/Account.js');
      let accountHelperController = new AccountHelperController();

      expect(objectutilities.getClassName(accountHelperController)).to.equal('AccountHelperController');

    });
  });

  xdescribe('upgradeAccount', () => {

    it('successfully upgrades a account', () => {

      let account = MockEntities.getValidAccount();
      let session = MockEntities.getValidSession();

      account.billing = {
        session: session.id,
        plan: 'basic'
      };

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Account.js'), class {
        constructor(){}
        disableACLs(){}
        enableACLs(){}
        update({entity, allow_billing_overwrite}){
          expect(entity).to.be.a('object');
          expect(allow_billing_overwrite).to.be.a('boolean');
          return Promise.resolve(entity);
        }
        get({id}){
          expect(id).to.be.a('string');
          return Promise.resolve(account);
        }

      });

      const AccountHelperController = global.SixCRM.routes.include('helpers', 'entities/account/Account.js');
      let accountHelperController = new AccountHelperController();

      return accountHelperController.upgradeAccount({account: account.id, plan: 'premium'}).then(result => {
        expect(result).to.have.property('message');
      });

    });

  });

  describe('cancelDeactivation', () => {

    it('successfully cancels a scheduled deactivation', () => {

      let account = MockEntities.getValidAccount();
      let session = MockEntities.getValidSession();

      account.billing = {
        deactivate: timestamp.getISO8601(),
        session: session.id,
        plan: 'basic'
      }

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Account.js'), class {
        constructor(){}
        disableACLs(){}
        enableACLs(){}
        update({entity, allow_billing_overwrite}){
          expect(entity).to.be.a('object');
          expect(allow_billing_overwrite).to.be.a('boolean');
          return Promise.resolve(entity);
        }
        get({id}){
          expect(id).to.be.a('string');
          return Promise.resolve(account);
        }

      });

      mockery.registerMock('../../../helpers/statemachine/StateMachine', class {
				stopExecutions() {}
      });

      const AccountHelperController = global.SixCRM.routes.include('helpers', 'entities/account/Account.js');
      let accountHelperController = new AccountHelperController();

      return accountHelperController.cancelDeactivation({account: account.id}).then(result => {
        expect(result).to.have.property('message');
        expect(result.message).to.equal('Deactivation Cancelled');
      });

    });

  });

  describe('deactivateAccount', () => {
    it('successfully schedules a account for deactivation', () => {

      let account = MockEntities.getValidAccount();
      let session = MockEntities.getValidSession();

      account.billing = {
        session: session.id,
        plan: 'basic'
      }

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Account.js'), class {
        constructor(){}
        disableACLs(){}
        enableACLs(){}
        update({entity, allow_billing_overwrite}){
          expect(entity).to.be.a('object');
          expect(allow_billing_overwrite).to.be.a('boolean');
          return Promise.resolve(entity);
        }
        get({id}){
          expect(id).to.be.a('string');
          return Promise.resolve(account);
        }

			});

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
        async listByAccount(){
          return { sessions: [] };
        }
				async cancelSession(){}
				async get({id}){
					return MockEntities.getValidSession(id);
				}
			});

      mockery.registerMock('../../events/EventPush', class {
        async pushEvent(){}
      });

      const AccountHelperController = global.SixCRM.routes.include('helpers', 'entities/account/Account.js');
      let accountHelperController = new AccountHelperController();

      return accountHelperController.deactivateAccount({account: account.id}).then(result => {
        expect(result).to.have.property('message');
        expect(result).to.have.property('deactivate');
        expect(result.deactivate).to.be.a('string');
      });

    });

  });

  describe('activateAccount', () => {
    it('successfully activates a account', () => {

      let account  = MockEntities.getValidAccount();
      let session = MockEntities.getValidSession();
      let customer = MockEntities.getValidCustomer();
      let owner_acl = MockEntities.getValidUserACL();
      let rebill = MockEntities.getValidRebill();
      let rebills = [rebill];
      let transaction = MockEntities.getValidTransaction();
      rebill.amount = transaction.amount;
      let transactions = {transactions: [transaction]};

      owner_acl.role = 'cae614de-ce8a-40b9-8137-3d3bdff78039'
      owner_acl.user = customer.email;
      let user_acls = [owner_acl];

      session.account = '3f4abaf6-52ac-40c6-b155-d04caeb0391f';
      session.watermark = {
        product_schedules: [
          {
            product_schedule: {
              schedule: [
                {
                  quantity: 1,
                  product: {
                    id: '3ac1a59a-6e41-4074-9712-3c80ef3f3e95'
                  }
                }
              ]
            },
            quantity: 1
          }
        ]
      };

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
        constructor(){}
        disableACLs(){}
        enableACLs(){}
        get({id}){
          expect(id).to.be.a('string');
          return Promise.resolve(session);
        }
        getCustomer(session){
          expect(session).to.be.a('object');
          return Promise.resolve(customer);
        }
        listRebills(session){
          expect(session).to.be.a('object');
          return Promise.resolve(rebills);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Account.js'), class {
        constructor(){}
        disableACLs(){}
        enableACLs(){}
        update({entity, allow_billing_overwrite}){
          expect(entity).to.be.a('object');
          expect(allow_billing_overwrite).to.be.a('boolean');
          return Promise.resolve(entity);
        }
        get({id}){
          expect(id).to.be.a('string');
          return Promise.resolve(account);
        }

      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'UserACL.js'), class {
        constructor(){}
        disableACLs(){}
        enableACLs(){}
        getACLByAccount({account}){
          expect(account).to.be.a('object');
          return Promise.resolve(user_acls);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
        constructor(){}
        disableACLs(){}
        enableACLs(){}
        listTransactions(rebill){
          expect(rebill).to.be.a('object');
          return Promise.resolve(transactions);
        }
      });

      const AccountHelperController = global.SixCRM.routes.include('helpers', 'entities/account/Account.js');
      let accountHelperController = new AccountHelperController();

      return accountHelperController.activateAccount({account: account.id, session: session.id}).then(result => {
        expect(result).to.have.property('message');
        expect(result).to.have.property('activated');
        expect(result.activated).to.equal(true);
      });

    });
  });

  describe('validateSessionPaymentHistory', () => {
    it('successfully validates payment history', () => {

      let session = MockEntities.getValidSession();
      session.id = '3f4abaf6-52ac-40c6-b155-d04caeb0391f';

      let rebill = MockEntities.getValidRebill();
      rebill.amount = 30;
      let rebills = [rebill];

      let transaction = MockEntities.getValidTransaction();
      transaction.amount = rebill.amount;
      let transactions = {transactions:[transaction]};

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
        constructor(){}
        disableACLs(){}
        enableACLs(){}
        listRebills(session){
          expect(session).to.be.a('object');
          return Promise.resolve(rebills);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
        constructor(){}
        disableACLs(){}
        enableACLs(){}
        listBySession({session}){
          expect(session).to.be.a('string');
          return Promise.resolve({rebills: rebills});
        }
        listTransactions(rebill){
          expect(rebill).to.be.a('object');
          return Promise.resolve(transactions);
        }
      });

      const AccountHelperController = global.SixCRM.routes.include('helpers', 'entities/account/Account.js');
      let accountHelperController = new AccountHelperController();

      return accountHelperController._validateSessionPaymentHistory({session: session}).then(result => {
        expect(result).to.equal(true);
      });

    });

    it('successfully validates payment history when has previous declines', () => {

      let session = MockEntities.getValidSession();
      session.id = '3f4abaf6-52ac-40c6-b155-d04caeb0391f';

      let rebill1 = MockEntities.getValidRebill();
      rebill1.amount = 30;

      let rebill2 = MockEntities.getValidRebill();
      rebill2.amount = 30;

      let rebills = [rebill1, rebill2];

      let product_group = {
        quantity:1,
        amount: 30.00,
        product: {
      	  "account": "d3fa3bf3-7824-49f4-8261-87674482bf1c",
      	  "attributes": {
      	    "images": []
      	  },
      	  "created_at": "2018-05-01T20:21:55.566Z",
      	  "default_price": 30,
      	  "description": "$30 per month, unlimited transactions at $0.06 per transaction, one campaign",
      	  "id": "aba9a683-85a4-45e7-9004-576c99a811ce",
      	  "name": "Dynamic Watermark Product",
      	  "ship": false,
      	  "shipping_delay": 0,
      	  "sku": "basic",
      	  "updated_at": "2018-05-01T20:21:55.566Z"
      	}
      };

      let good_transaction = MockEntities.getValidTransaction();
      good_transaction.amount = 30.00;
      good_transaction.products = [product_group];

      let bad_transaction = MockEntities.getValidTransaction();
      bad_transaction.result = 'fail';
      bad_transaction.amount = 30.00;
      bad_transaction.products = [product_group];

      let transactions = {transactions:[bad_transaction, good_transaction]};

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
        constructor(){}
        disableACLs(){}
        enableACLs(){}
        listRebills(session){
          expect(session).to.be.a('object');
          return Promise.resolve(rebills);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
        constructor(){}
        disableACLs(){}
        enableACLs(){}
        listBySession({session}){
          expect(session).to.be.a('string');
          return Promise.resolve({rebills: rebills});
        }
        listTransactions(rebill){
          expect(rebill).to.be.a('object');
          if(rebill.id == rebill1.id){
            return Promise.resolve({transactions:[bad_transaction]});
          }else if(rebill.id == rebill2.id){
            return Promise.resolve({transactions:[good_transaction]});
          }
          expect(false).to.equal(true);
        }
      });

      const AccountHelperController = global.SixCRM.routes.include('helpers', 'entities/account/Account.js');
      let accountHelperController = new AccountHelperController();

      return accountHelperController._validateSessionPaymentHistory({session: session}).then(result => {
        expect(result).to.equal(true);
      });

    });

  });

});

function getRealRebill(){

  return
}

function getRealSession(){

  return {
    "account": "3f4abaf6-52ac-40c6-b155-d04caeb0391f",
    "alias": "S49JZTE1SP",
    "campaign": "8b60000e-6a6b-4807-94d1-f737da089ee5",
    "completed": true,
    "created_at": "2018-05-04T18:36:40.087Z",
    "customer": "500d4829-f6de-4174-ab95-75f9d0fc287e",
    "id": "362aea17-9f9f-4706-bb17-6e6b73416b9f",
    "updated_at": "2018-05-04T18:36:48.441Z",
    "watermark": {
      "product_schedules": [
        {
          "product_schedule": {
            "account": "3f4abaf6-52ac-40c6-b155-d04caeb0391f",
            "created_at": "2018-05-01T20:24:30.428Z",
            "id": "37cbb0aa-a1e9-4ad0-afe3-38f1dce31d5b",
            "name": "Basic Subscription",
            "schedule": [
              {
                "period": 30,
                "price": 30,
                "product": {
                  "account": "3f4abaf6-52ac-40c6-b155-d04caeb0391f",
                  "attributes": {
                    "images": []
                  },
                  "created_at": "2018-05-01T20:21:55.566Z",
                  "default_price": 30,
                  "description": "$30 per month, unlimited transactions at $0.06 per transaction, one campaign",
                  "id": "3ac1a59a-6e41-4074-9712-3c80ef3f3e95",
                  "name": "Basic",
                  "ship": false,
                  "shipping_delay": 0,
                  "sku": "basic",
                  "updated_at": "2018-05-04T17:51:55.369Z"
                },
                "samedayofmonth": true,
                "start": 0
              }
            ],
            "updated_at": "2018-05-04T17:51:56.318Z"
          },
          "quantity": 1
        }
      ],
      "products": []
    }
  };

}

function getRealTransaction(){

  return {
    "account": "3f4abaf6-52ac-40c6-b155-d04caeb0391f",
    "alias": "TDSV6GPHYX",
    "amount": 30,
    "created_at": "2018-05-04T18:36:46.578Z",
    "id": "0081c032-3482-4b76-9925-6d821cfaa719",
    "merchant_provider": "8d8f56ef-424f-4db9-9e38-36e1ad78812d",
    "processor_response": "{\"code\":\"success\",\"message\":\"Success\",\"result\":{\"code\":\"success\",\"response\":{\"statusCode\":200,\"statusMessage\":\"OK\",\"body\":{\"id\":\"ch_1CO8lt2eZvKYlo2CGGPpoeWq\",\"object\":\"charge\",\"amount\":3000,\"amount_refunded\":0,\"application\":null,\"application_fee\":null,\"balance_transaction\":\"txn_1CO8lt2eZvKYlo2C4jE9QsLS\",\"captured\":true,\"created\":1525459005,\"currency\":\"usd\",\"customer\":null,\"description\":null,\"destination\":null,\"dispute\":null,\"failure_code\":null,\"failure_message\":null,\"fraud_details\":{},\"invoice\":null,\"livemode\":false,\"metadata\":{},\"on_behalf_of\":null,\"order\":null,\"outcome\":{\"network_status\":\"approved_by_network\",\"reason\":null,\"risk_level\":\"normal\",\"seller_message\":\"Payment complete.\",\"type\":\"authorized\"},\"paid\":true,\"receipt_email\":null,\"receipt_number\":null,\"refunded\":false,\"refunds\":{\"object\":\"list\",\"data\":[],\"has_more\":false,\"total_count\":0,\"url\":\"/v1/charges/ch_1CO8lt2eZvKYlo2CGGPpoeWq/refunds\"},\"review\":null,\"shipping\":null,\"source\":{\"id\":\"card_1CO8lt2eZvKYlo2CxXkU12j6\",\"object\":\"card\",\"address_city\":null,\"address_country\":null,\"address_line1\":null,\"address_line1_check\":null,\"address_line2\":null,\"address_state\":null,\"address_zip\":null,\"address_zip_check\":null,\"brand\":\"Visa\",\"country\":\"US\",\"customer\":null,\"cvc_check\":null,\"dynamic_last4\":null,\"exp_month\":4,\"exp_year\":2022,\"fingerprint\":\"Xt5EWLLDS7FJjR1c\",\"funding\":\"credit\",\"last4\":\"4242\",\"metadata\":{},\"name\":null,\"tokenization_method\":null},\"source_transfer\":null,\"statement_descriptor\":null,\"status\":\"succeeded\",\"transfer_group\":null}},\"message\":\"Success\"},\"merchant_provider\":\"8d8f56ef-424f-4db9-9e38-36e1ad78812d\",\"creditcard\":\"fb553585-c7d5-4364-948c-8eea18fa27ee\"}",
    "products": [
      {
        "amount": 30,
        "merchantprovidergroupassociation": {
          "account": "3f4abaf6-52ac-40c6-b155-d04caeb0391f",
          "campaign": "8b60000e-6a6b-4807-94d1-f737da089ee5",
          "created_at": "2018-05-01T20:49:41.208Z",
          "entity": "8b60000e-6a6b-4807-94d1-f737da089ee5",
          "entity_type": "campaign",
          "id": "5b7fe7b1-f30c-47c3-9426-433b1e460aab",
          "merchantprovidergroup": "8a9b88d3-a2e5-49cf-a38f-63468312ceae",
          "updated_at": "2018-05-04T17:51:53.805Z"
        },
        "product": {
          "account": "3f4abaf6-52ac-40c6-b155-d04caeb0391f",
          "attributes": {
            "images": []
          },
          "created_at": "2018-05-01T20:21:55.566Z",
          "default_price": 30,
          "description": "$30 per month, unlimited transactions at $0.06 per transaction, one campaign",
          "id": "3ac1a59a-6e41-4074-9712-3c80ef3f3e95",
          "name": "Basic",
          "ship": false,
          "shipping_delay": 0,
          "sku": "basic",
          "updated_at": "2018-05-04T17:51:55.369Z"
        },
        "quantity": 1
      }
    ],
    "rebill": "5529f43d-349f-4574-ba6e-bdf60c74897a",
    "result": "success",
    "type": "sale",
    "updated_at": "2018-05-04T18:36:46.578Z"
  };

}

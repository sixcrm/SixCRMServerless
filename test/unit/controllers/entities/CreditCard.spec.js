let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
let PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidCreditCard() {
  return MockEntities.getValidCreditCard();
}

function getValidCustomer() {
  return MockEntities.getValidCustomer();
}

describe('controllers/entities/CreditCard.js', () => {

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

    describe('create', () => {

      it('successfully creates a creditcard entity', () => {

        let creditcard_prototype = MockEntities.getValidTransactionCreditCard();
        let creditcard = MockEntities.getValidCreditCard();

        PermissionTestGenerators.givenUserWithAllowed('*', 'creditcard');

        mockery.registerMock(global.SixCRM.routes.path('lib', 'providers/dynamodb-provider.js'), class {
          constructor(){}
          saveRecord(){
            return Promise.resolve({
              Items: [creditcard]
            })
          }
        });

        mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), class {
          constructor(){}
          addToSearchIndex(){
            return Promise.resolve(true);
          }
        });

        let CreditCardController = global.SixCRM.routes.include('controllers','entities/CreditCard');
        const creditCardController = new CreditCardController();

        creditCardController.exists = () => {
          return Promise.resolve(false);
        }

        return creditCardController.create({entity: creditcard_prototype}).then(() => {

          expect(true).to.equal(true);
        });

      });

    });

    describe('assureCreditCard', () => {

      it('assures that a creditcard is stored', () => {



      });

    });

    describe('censorEncryptedAttributes', () => {

        it('censors the credit card token ', () => {

            const creditcard = getValidCreditCard();

            class mockHelper {
                lastFour() {
                    return '************1111';
                }
            }

            mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/creditcard/CreditCard.js'), mockHelper);

            let CreditCardController = global.SixCRM.routes.include('controllers','entities/CreditCard');
            const creditCardController = new CreditCardController();

            creditCardController.censorEncryptedAttributes(creditcard);

            expect(creditcard).to.have.property('token');
            expect(creditcard.token).to.have.property('token');
            expect(creditcard.token.token).to.equal('****');

        });

    });

    describe('listCustomers', () => {
        it('gets customers', () => {
			const creditcard = getValidCreditCard();
			const customer = getValidCustomer();
			creditcard.customers = [customer.id];

			PermissionTestGenerators.givenUserWithAllowed('read', 'customer');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Customer.js'), class {
				get() {
					return Promise.resolve(customer);
				}
			});

			const CreditCardController = global.SixCRM.routes.include('controllers', 'entities/CreditCard');
			const creditCardController = new CreditCardController();

			return creditCardController.listCustomers(creditcard)
			.then(customers => {
				expect(customers).to.include(customer);
			});
		});
    });
});

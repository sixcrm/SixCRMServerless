'use strict'
const _ = require('underscore');
const mockery = require('mockery');
let chai = require('chai')
const expect = chai.expect;
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');
const RefundHelperController = global.SixCRM.routes.include('helpers', 'transaction/Refund.js');

function getValidRefundParameters(){

  let transaction = getValidTransaction();
  let amount = (parseFloat(transaction.amount) / 2)

  transaction.processor_response = JSON.parse(transaction.processor_response);

  return {
    transaction: transaction
  };

}

function assumePermissionedRole(){

  let permissions = [
    {
      action:'*',
      object: '*'
    }
  ];

  PermissionTestGenerators.givenUserWithPermissionArray(permissions, 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

}

function getInvalidArgumentsArray(omit){

  let invalid_arguments = [{}, [], new Error(), null, undefined, 123, 'abc', () => {}];

  omit = (_.isUndefined(omit))?[]:omit;
  return arrayutilities.filter(invalid_arguments, (invalid_argument) => {
    return !(_.contains(omit, invalid_argument));
  });

}

function getValidTransaction(){

    let transaction = MockEntities.getValidTransaction();

    transaction.products.forEach(transaction_product => {
        transaction_product.product = transaction_product.product.id;
    });

    return transaction;
}

function getTransactionMerchantProvider(){

  return MockEntities.getValidMerchantProvider();

}

function getValidParameters(){

  return {
    transaction: getValidTransaction()
  }

}

describe('helpers/transaction/Refund.js', () => {

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

      it('successfully constructs a refund class', () => {

        let vh = new RefundHelperController();

        expect(vh.constructor.name).to.equal('Refund');

      });

    });

    describe('setParameters', () => {

      it('fails to set parameters', () => {

        let vh = new RefundHelperController();
        let invalid_arguments_array = getInvalidArgumentsArray();

        arrayutilities.map(invalid_arguments_array, invalid_argument => {
          try{
            vh.setParameters(invalid_argument);
          }catch(error){
            expect(error.message).to.be.defined;
          }
        });
      });

      it('successfully sets parameters', () => {

        let vh = new RefundHelperController();

        let valid_parameters = getValidParameters();

        vh.setParameters(valid_parameters);

      });

    });

    describe('hydrateParameters', () => {

      it('successfully hydrates the parameters', () => {

        assumePermissionedRole();

        let merchant_provider = getTransactionMerchantProvider();
        let transaction = getValidTransaction();

        mockery.registerMock(global.SixCRM.routes.path('entities', 'Transaction.js'), {
          getMerchantProvider:(transaction) => {
            return Promise.resolve(merchant_provider);
          },
          get:({id}) => {
            return Promise.resolve(transaction);
          }
        });

        let vh = new RefundHelperController();

        let valid_parameters = getValidParameters();

        vh.parameters.set('transaction', valid_parameters.transaction);

        return vh.hydrateParameters().then(result => {
          expect(result).to.equal(true);

          let test_merchantprovider = merchant_provider;
          let hydrated_merchantprovider = vh.parameters.get('selected_merchantprovider');

          delete hydrated_merchantprovider.created_at;
          delete hydrated_merchantprovider.updated_at;
          delete test_merchantprovider.created_at;
          delete test_merchantprovider.updated_at;

          expect(test_merchantprovider).to.deep.equal(hydrated_merchantprovider);

        });

      });

    });

    describe('createProcessingParameters', () => {

      //fails when transaction isn't set
      //fails when transaction isn't the right thing...

      it('successfully hydrates the parameters', () => {

        assumePermissionedRole()

        let vh = new RefundHelperController();

        vh.parameters.set('transaction', getValidTransaction());

        return vh.createProcessingParameters().then(processing_parameters => {

          expect(processing_parameters).to.have.property('transaction');

          expect(vh.parameters.get('refund')).to.deep.equal(processing_parameters);

        });

      });

    });

    describe('refund', () => {

      it('successfully refunds a transaction', () => {

        assumePermissionedRole()

        let merchant_provider = getTransactionMerchantProvider();
        let transaction = getValidTransaction();

        mockery.registerMock(global.SixCRM.routes.path('entities', 'Transaction.js'), {
          getMerchantProvider:(transaction) => {
            return Promise.resolve(merchant_provider);
          },
          get:({id}) => {
            return Promise.resolve(transaction);
          }
        });

        let mock_gateway = class {
          constructor(){}
          refund({argumentation}){
            return Promise.resolve(
              {
                code: 200,
                result: 'success',
                message: 'Success'
              }
            );
          }
        };

        mockery.registerMock(global.SixCRM.routes.path('vendors', 'merchantproviders/NMI/handler.js'), mock_gateway);

        let vh = new RefundHelperController();

        return vh.refund({transaction:transaction}).then(result => {
          expect(result).to.have.property('code');
          expect(result).to.have.property('result');
          expect(result).to.have.property('message');
        });

      });

    });

    describe('refundTransaction', () => {

        it('refunds a transaction', () => {

            let merchant_provider = getTransactionMerchantProvider();

            let transaction = getValidTransaction();

            mockery.registerMock(global.SixCRM.routes.path('entities', 'Transaction.js'), {
                getMerchantProvider:(transaction_params) => {
                    expect(transaction_params).to.equal(transaction.id);
                    return Promise.resolve(merchant_provider);
                },

                get:({id}) => {
                    expect(id).to.equal(transaction.id);
                    return Promise.resolve(transaction);
                }
            });

            mockery.registerMock('request', {
                post: (request_options, callback) => {
                    callback(null, transaction.processor_response.result);
                }
            });

            let mock_gateway = class {
                constructor(){}

                refund({argumentation}){
                    return Promise.resolve(
                        {
                            code: 200,
                            result: 'success',
                            message: 'Success'
                        }
                    );
                }
            };

            mockery.registerMock(global.SixCRM.routes.path('vendors', 'merchantproviders/NMI/handler.js'), mock_gateway);

            let vh = new RefundHelperController();

            vh.parameters.set('selected_merchantprovider', merchant_provider);
            vh.parameters.set('transaction', transaction);

            return vh.refundTransaction().then(result => {
                expect(result).to.have.property('code');
                expect(result).to.have.property('result');
                expect(result).to.have.property('message');
            });

        });

    });

});

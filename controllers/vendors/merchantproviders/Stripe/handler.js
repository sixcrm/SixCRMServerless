
const _ = require('lodash');
const stripe = require('stripe');

const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

const MerchantProvider = global.SixCRM.routes.include('vendors', 'merchantproviders/MerchantProvider.js');

class StripeController extends MerchantProvider {

    constructor({merchant_provider}){

      super(arguments[0]);

      this.configure(merchant_provider);

      this.methods = {
        process: 'CreateCharge',
        refund: 'RefundsCreate',
        test: 'ListCharges',
        reverse: 'RefundsCreate'
      };

      this.parameter_validation = {
        'creditcardtoken':global.SixCRM.routes.path('model', 'vendors/merchantproviders/Stripe/creditcardtokenresponse.json')
      };

      this.parameter_definition = {
        process:{
          required:{
            action: 'action',
            customer: 'customer',
            creditcard: 'creditcard',
            amount: 'amount'
          },
          optional:{}
        },
        test:{
          required:{
            action: 'action'
          },
          optional:{}
        },
        refund:{
          required:{
            action: 'action',
            transaction:'transaction'
          },
          optional:{}
        },
        reverse:{
          required:{
            action: 'action',
            transaction:'transaction'
          },
          optional:{}
        }
      };

      this.augmentParameters();

      this.instantiateStripe();

    }

    instantiateStripe(){

      du.debug('Instantiate Stripe');

      let api_key = this.parameters.get('merchantprovider').gateway.api_key;

      this.stripe = stripe(api_key);

    }

    process(){

      du.debug('Process');
      let argumentation = arguments[0];

      argumentation.action = 'process';

      return Promise.resolve()
      .then(() => this.parameters.setParameters({argumentation: argumentation, action: 'process'}))
      .then(() => this.setMethod())
      .then(() => this.createCardToken())
      .then(() => this.createParametersObject())
      .then(() => this.issueRequest())
      .then(() => this.respond({}));

    }

    refund(){

      du.debug('Refund');

      let argumentation = arguments[0];

      argumentation.action = 'refund';

      return Promise.resolve()
      .then(() => this.parameters.setParameters({argumentation: argumentation, action: 'refund'}))
      .then(() => this.setMethod())
      .then(() => this.createParametersObject())
      .then(() => this.issueRequest())
      .then(() => this.respond({}));

    }

    reverse(){

      du.debug('Reverse');

      let argumentation = arguments[0];

      argumentation.action = 'reverse';

      return Promise.resolve()
      .then(() => this.parameters.setParameters({argumentation: argumentation, action: 'reverse'}))
      .then(() => this.setMethod())
      .then(() => this.createParametersObject())
      .then(() => this.issueRequest())
      .then(() => this.respond({}));

    }

    test(){

      du.debug('Test');
      let argumentation = {
        action: 'test'
      };

      return Promise.resolve()
      .then(() => this.parameters.setParameters({argumentation: argumentation, action: 'test'}))
      .then(() => this.setMethod())
      .then(() => this.createParametersObject())
      .then(() => this.issueRequest())
      .then(() => this.respond({}));

    }

    getListChargesRequestParameters(){

      du.debug('Get List Charges Request Parameters');

      if(this.parameters.get('action') == 'test'){
        return {limit: 1};
      }

    }

    createCardToken(){

      du.debug('Create Card Token');

      let parameters_object = this.createCreditCardTokenParameters();

      return new Promise((resolve, reject) => {

        this.stripe.tokens.create(
          parameters_object,
          (error, token) => {
            if(error){
              du.error(error);
              return reject(error);
            }
            return resolve(token);
          }
        );

      }).catch(error => {

        return {
          error: error,
          response: {
            statusCode: error.statusCode,
            body: error.message
          },
          body: error.message
        };

      }).then(response => {
        this.parameters.set('creditcardtoken', response);
        return true;
      });

    }

    createCreditCardTokenParameters(){

      let creditcard = this.parameters.get('creditcard');

      let token_request_object = objectutilities.transcribe(
        {
          number: 'number',
          cvc: 'ccv'
        },
        creditcard,
        {}
      );

      let CreditCardHelper = global.SixCRM.routes.include('helpers', 'entities/creditcard/CreditCard.js');
      let creditCardHelper = new CreditCardHelper();

      token_request_object.exp_month = creditCardHelper.getExpirationMonth(creditcard);
      token_request_object.exp_year = creditCardHelper.getExpirationYear(creditcard);

      return {
        card: token_request_object
      };

    }

    getRefundsCreateRequestParameters(){

      du.debug('Get Refunds Create Request Parameters');

      let transaction = this.parameters.get('transaction');
      let amount = this.parameters.get('amount', false, null);
      let action = this.parameters.get('action');

      let parameters_object = {
        charge: transaction.processor_response.result.id
      };

      if (objectutilities.hasRecursive(transaction, 'processor_response.result.response.body.id')) {
        parameters_object.charge = transaction.processor_response.result.response.body.id;
      }

      if(action == 'reverse'){
        parameters_object.reverse_transfer = true;
      }

      if(!_.isNull(amount) && action !== 'reverse'){
        parameters_object.amount = amount * 100;
      }

      return parameters_object;

    }


    getCreateChargeRequestParameters(){

      du.debug('Get List Charges Request Parameters');

      let amount = this.parameters.get('amount');
      let credit_card_token = this.parameters.get('creditcardtoken').id;

      amount = amount * 100;

      return {
        amount: amount,
        currency: 'usd',
        source: credit_card_token
      };

    }

    issueRefundsCreateRequest(){

      du.debug('Issue Refunds Create Request');

      let parameters_object = this.parameters.get('parametersobject');

      return new Promise((resolve, reject) => {

        this.stripe.refunds.create(
          parameters_object,
          (error, refund) => {
            if(error){
              du.error(error);
              return reject(error);
            }
            return resolve(refund);
          }
        );

      }).then(response => {

        return {
          error: null,
          response: {
            statusCode: 200,
            statusMessage:'OK',
            body: response
          },
          body: response
        };

      }).catch(error => {

        return {
          error: error,
          response: {
            statusCode: error.statusCode,
            body: error.message
          },
          body: error.message
        };

      }).then(response => {
        this.parameters.set('vendorresponse', response);
        return true;
      });


    }

    issueCreateChargeRequest(){

      du.debug('Issue Create Charge Request');

      let parameters_object = this.parameters.get('parametersobject');

      return new Promise((resolve, reject) => {

        this.stripe.charges.create(
          parameters_object,
          (error, charges) => {
            if(error){
              du.error(error);
              return reject(error);
            }
            return resolve(charges);
          }
        );

      }).then(response => {

        return {
          error: null,
          response: {
            statusCode: 200,
            statusMessage:'OK',
            body: response
          },
          body: response
        };

      }).catch(error => {

        return {
          error: error,
          response: {
            statusCode: error.statusCode,
            body: error.message
          },
          body: error.message
        };

      }).then(response => {
        this.parameters.set('vendorresponse', response);
        return true;
      });


    }

    issueListChargesRequest(){

      du.debug('Issue List Charges Request');

      let parameters_object = this.parameters.get('parametersobject');

      return new Promise((resolve, reject) => {

        this.stripe.charges.list(
          parameters_object,
          (error, charges) => {
            if(error){
              du.error(error);
              return reject(error);
            }
            return resolve(charges);
          }
        );

      }).then(response => {

        return {
          error: null,
          response: {
            statusCode: 200,
            statusMessage:'OK',
            body: response
          },
          body: response
        };

      }).catch(error => {

        return {
          error: error,
          response: {
            statusCode: error.statusCode,
            body: error.message
          },
          body: error.message
        };

      }).then(response => {
        this.parameters.set('vendorresponse', response);
        return true;
      });

    }

}

module.exports = StripeController;

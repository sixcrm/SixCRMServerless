'use strict';
const querystring = require('querystring');

const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const HttpProvider = global.SixCRM.routes.include('lib', 'providers/http-provider.js');
const httpprovider = new HttpProvider();

const MerchantProvider = global.SixCRM.routes.include('vendors', 'merchantproviders/MerchantProvider.js');

class InnovioController extends MerchantProvider {

    constructor({merchant_provider}){

      super(arguments[0]);

      this.configure(merchant_provider);

      this.methods = {
        process: 'CCAUTHCAP',
        refund: 'CCCREDIT',
        test: 'TESTAUTH',
        reverse: 'CCREVERSE'
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
        reverse:{
          required:{
            action: 'action',
            transaction:'transaction'
          },
          optional:{}
        },
        refund:{
          required:{
            action: 'action',
            transaction:'transaction'
          },
          optional:{
            amount: 'amount'
          }
        }
      };

      this.augmentParameters();

    }

    process(){

      du.debug('Process');
      let argumentation = arguments[0];

      argumentation.action = 'process';

      return Promise.resolve()
      .then(() => this.parameters.setParameters({argumentation: argumentation, action: 'process'}))
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

    test(){

      du.debug('Test');
      let argumentation = arguments[0];

      argumentation.action = 'test';

      return Promise.resolve()
      .then(() => this.parameters.setParameters({argumentation: argumentation, action: 'test'}))
      .then(() => this.setMethod())
      .then(() => this.createParametersObject())
      .then(() => this.issueRequest())
      .then(() => {
        du.info(this.parameters.get('vendorresponse'));
        return true;
      })
      .then(() => this.respond({}));

    }


    getCCAUTHCAPRequestParameters(){

      du.debug('Get CCAUTHCAP Request Parameters');

      let creditcard = this.parameters.get('creditcard');
      let customer = this.parameters.get('customer');
      let amount = this.parameters.get('amount');

      let source_object = {
        creditcard: creditcard,
        amount: amount,
        customer: customer,
        count: 1
      };

      let parameter_specification = {
        required:{
          li_value_1:'amount',
          li_count_1:'count',
          pmt_numb:'creditcard.number',
          pmt_expiry:'creditcard.expiration'
        },
        optional:{
          cust_fname:'customer.firstname',
          cust_lname:'customer.lastname',
          cust_email:'customer.email',
          //Technical Debt:  We don't have this any longer...
          pmt_key:'creditcard.ccv',
          //cust_login:'',
          //cust_password:'',
          bill_addr:'creditcard.address.line1',
          bill_addr_city:'creditcard.address.city',
          bill_addr_state:'creditcard.address.state',
          bill_addr_zip:'creditcard.address.zip',
          bill_addr_country:'creditcard.address.country',
          xtl_order_id:'transaction.alias',
          xtl_cust_id:'customer.id',
          xtl_ip:'session.ip_address'
        }
      }

      let request_parameters = objectutilities.transcribe(
        parameter_specification.required,
        source_object,
        {},
        true
      );

      request_parameters = objectutilities.transcribe(
        parameter_specification.optional,
        source_object,
        request_parameters,
        false
      );

      return request_parameters;

    }

    getCCCREDITRequestParameters(){

      du.debug('Get CCCREDIT Request Parameters');

      let transaction = this.parameters.get('transaction');
      let amount = this.parameters.get('amount');

      let source_object = {
        amount: amount,
        transaction: transaction
      };

      let parameter_specification = {
        required:{
          request_ref_po_id:'transaction.processor_response.result.PO_ID',
          li_value_1:'amount'
        },
        optional:{
        }
      }

      let request_parameters = objectutilities.transcribe(
        parameter_specification.required,
        source_object,
        {},
        true
      );

      request_parameters = objectutilities.transcribe(
        parameter_specification.optional,
        source_object,
        request_parameters,
        false
      );

      return request_parameters;

    }

    getCCREVERSERequestParameters(){

      du.debug('Get CCREVERSE Request Parameters');

      let transaction = this.parameters.get('transaction');

      let source_object = {
        transaction: transaction
      };

      let parameter_specification = {
        required:{
          request_ref_po_id:'transaction.processor_response.result.PO_ID',
        },
        optional:{
        }
      }

      let request_parameters = objectutilities.transcribe(
        parameter_specification.required,
        source_object,
        {},
        true
      );

      request_parameters = objectutilities.transcribe(
        parameter_specification.optional,
        source_object,
        request_parameters,
        false
      );

      return request_parameters;

    }

    issueCCAUTHCAPRequest(){

      du.debug('Issue Create Charge Request');

      let parameters_object = this.parameters.get('parametersobject');

      let endpoint = parameters_object.endpoint;

      delete parameters_object.endpoint;

      let parameter_querystring = querystring.stringify(parameters_object);

      var request_options = {
        headers: {'content-type' : 'application/x-www-form-urlencoded'},
        url: endpoint,
        body: parameter_querystring
      };

      return httpprovider.post(request_options).then(result => {

        this.parameters.set('vendorresponse', result);
        return true;

      });

    }

    issueCCREVERSERequest(){

      du.debug('Issue CCREVERSE Request');

      let parameters_object = this.parameters.get('parametersobject');

      let endpoint = parameters_object.endpoint;

      delete parameters_object.endpoint;

      let parameter_querystring = querystring.stringify(parameters_object);

      var request_options = {
        headers: {'content-type' : 'application/x-www-form-urlencoded'},
        url: endpoint,
        body: parameter_querystring
      };

      return httpprovider.post(request_options).then(result => {

        this.parameters.set('vendorresponse', result);
        return true;

      });

    }

    issueCCCREDITRequest(){

      du.debug('Issue CCCREDIT Request');

      let parameters_object = this.parameters.get('parametersobject');

      let endpoint = parameters_object.endpoint;

      delete parameters_object.endpoint;

      let parameter_querystring = querystring.stringify(parameters_object);

      var request_options = {
        headers: {'content-type' : 'application/x-www-form-urlencoded'},
        url: endpoint,
        body: parameter_querystring
      };

      return httpprovider.post(request_options).then(result => {

        this.parameters.set('vendorresponse', result);
        return true;

      });

    }

    issueTESTAUTHRequest(){

      du.debug('Issue TESTAUTH Request');

      let parameters_object = this.parameters.get('parametersobject');

      let endpoint = parameters_object.endpoint;

      delete parameters_object.endpoint;

      let parameter_querystring = querystring.stringify(parameters_object);

      var request_options = {
        headers: {'content-type' : 'application/x-www-form-urlencoded'},
        url: endpoint,
        body: parameter_querystring
      };

      return httpprovider.post(request_options).then(result => {

        this.parameters.set('vendorresponse', result);
        return true;

      });

    }

    getTESTAUTHMerchantProviderParameters(){

      du.debug('GET TESTAUTH Merchant Provider Parameters');

      let merchant_provider = this.parameters.get('merchantprovider');

      let source_object = {
        merchant_provider: merchant_provider
      };

      let parameter_specification = {
        required:{
          req_username: 'merchant_provider.gateway.username',
          req_password:'merchant_provider.gateway.password',
          site_id: 'merchant_provider.gateway.site_id',
          merchant_acct_id: 'merchant_provider.gateway.merchant_account_id',
          li_prod_id_1:'merchant_provider.gateway.product_id'
        },
        optional:{
        }
      }

      let request_parameters = objectutilities.transcribe(
        parameter_specification.required,
        source_object,
        {},
        true
      );

      request_parameters = objectutilities.transcribe(
        parameter_specification.optional,
        source_object,
        request_parameters
      );

      return request_parameters;

    }

    getCCAUTHCAPMerchantProviderParameters(){

      du.debug('GET CCAUTHCAP Merchant Provider Parameters');

      let merchant_provider = this.parameters.get('merchantprovider');

      let source_object = {
        merchant_provider: merchant_provider
      };

      let parameter_specification = {
        required:{
          req_username: 'merchant_provider.gateway.username',
          req_password:'merchant_provider.gateway.password',
          site_id: 'merchant_provider.gateway.site_id',
          merchant_acct_id: 'merchant_provider.gateway.merchant_account_id',
          li_prod_id_1:'merchant_provider.gateway.product_id'
        },
        optional:{
        }
      }

      let request_parameters = objectutilities.transcribe(
        parameter_specification.required,
        source_object,
        {},
        true
      );

      request_parameters = objectutilities.transcribe(
        parameter_specification.optional,
        source_object,
        request_parameters
      );

      return request_parameters;

    }

    getCCREVERSEMerchantProviderParameters(){

      du.debug('GET CCREVERSE Merchant Provider Parameters');

      let merchant_provider = this.parameters.get('merchantprovider');

      let source_object = {
        merchant_provider: merchant_provider
      };

      let parameter_specification = {
        required:{
          req_username: 'merchant_provider.gateway.username',
          req_password:'merchant_provider.gateway.password',
          site_id: 'merchant_provider.gateway.site_id',
          merchant_acct_id: 'merchant_provider.gateway.merchant_account_id',
          li_prod_id_1:'merchant_provider.gateway.product_id'
        },
        optional:{
        }
      }

      let request_parameters = objectutilities.transcribe(
        parameter_specification.required,
        source_object,
        {},
        true
      );

      request_parameters = objectutilities.transcribe(
        parameter_specification.optional,
        source_object,
        request_parameters
      );

      return request_parameters;

    }

    getCCREFUNDMerchantProviderParameters(){

      du.debug('GET CCRREFUND Merchant Provider Parameters');

      let merchant_provider = this.parameters.get('merchantprovider');

      let source_object = {
        merchant_provider: merchant_provider
      };

      let parameter_specification = {
        required:{
          req_username: 'merchant_provider.gateway.username',
          req_password:'merchant_provider.gateway.password',
          site_id: 'merchant_provider.gateway.site_id',
          merchant_acct_id: 'merchant_provider.gateway.merchant_account_id',
          li_prod_id_1:'merchant_provider.gateway.product_id'
        },
        optional:{
        }
      }

      let request_parameters = objectutilities.transcribe(
        parameter_specification.required,
        source_object,
        {},
        true
      );

      request_parameters = objectutilities.transcribe(
        parameter_specification.optional,
        source_object,
        request_parameters
      );

      return request_parameters;

    }

    getTESTAUTHMethodParameters(){

      du.debug('Get TESTAUTH Method Parameters');

      return {request_action: 'TESTAUTH'};

    }

    getCCAUTHCAPMethodParameters(){

      du.debug('Get CCAUTHCAP Method Parameters');

      return {request_action: 'CCAUTHCAP'};

    }

    getCCREVERSEMethodParameters(){

      du.debug('Get CCREVERSE Method Parameters');

      return {request_action: 'CCREVERSE'};

    }

    getCCCREDITMethodParameters(){

      du.debug('Get CCCREDIT Method Parameters');

      return {request_action: 'CCCREDIT'};

    }

}

module.exports = InnovioController;

'use strict'
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const numberutilities = global.SixCRM.routes.include('lib', 'number-utilities.js');
const mathutilities = global.SixCRM.routes.include('lib', 'math-utilities.js');
const randomutilities = global.SixCRM.routes.include('lib', 'random.js');
const signatureutilities = global.SixCRM.routes.include('lib', 'signature.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const httputilities = global.SixCRM.routes.include('lib', 'http-utilities.js');

const Parameters  = global.SixCRM.routes.include('providers', 'Parameters.js');
const TransactionUtilities = global.SixCRM.routes.include('helpers', 'transaction/TransactionUtilities.js');

const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

module.exports = class TransactionGeneratorHelperController {

  constructor(){

    this.parameter_defintion = {
      issue: {
        required:{
          endpoint: 'endpoint',
          account: 'account',
          accesskey: 'access_key',
          secretkey: 'secret_key',
          campaign: 'campaign',
          productschedule: 'product_schedule'
        },
        optional:{}
      }
    };

    this.parameter_validation = {
      'signature': global.SixCRM.routes.path('model', 'definitions/signature.json'),
      'endpoint': global.SixCRM.routes.path('model','definitions/url.json'),
      'accesskey': global.SixCRM.routes.path('model','definitions/accesskey.json'),
      'secretkey': global.SixCRM.routes.path('model','definitions/sha1.json'),
      'campaign': global.SixCRM.routes.path('model','definitions/uuidv4.json'),
      'productschedule': global.SixCRM.routes.path('model','definitions/uuidv4.json')
    };

    this.parameters = new Parameters({validation: this.parameter_validation, definition: this.parameter_defintion});

  }

  issue(){

    du.debug('Issue');

    return Promise.resolve()
    .then(() => this.parameters.setParameters({argumentation: arguments[0], action: 'issue'}))
    .then(() => this.createRequestProperties())
    .then(() => this.acquireToken())
    .then(() => this.createLead())
    .then(() => this.createOrder())
    .then(() => this.confirmOrder())
    .then(() => {
      du.output('Complete');
      return true;
    });

  }

  createRequestProperties(){

    du.debug('Create Request Properties');

    let customer = MockEntities.getValidTransactionCustomer();
    let fullname = customer.firstname+' '+customer.lastname;
    let creditcard = MockEntities.getValidTransactionCreditCard(fullname, customer.address);

    let signature = this.createTransactionSignature();

    this.parameters.set('customer', customer);
    this.parameters.set('creditcard', creditcard);
    this.parameters.set('signature', signature);

    return true;

  }

  createTransactionSignature(){

    du.debug('Create Transaction Signature');

    let access_key = this.parameters.get('accesskey');
    let secret_key = this.parameters.get('secretkey');
    let now = timestamp.now();

    let signature = signatureutilities.createSignature(secret_key, now);

    return access_key+':'+now+':'+signature;

  }

  acquireToken(){

    du.debug('Acquire Token');

    let post_body = {campaign: this.parameters.get('campaign')};

    let parameters = {
      headers: {Authorization: this.parameters.get('signature')},
      body: post_body,
      endpoint: this.parameters.get('endpoint')+'token/acquire/'+this.parameters.get('account')
    };

    du.info(parameters);

    return httputilities.postJSON(parameters).then(result => {

      du.debug(result.body);

      this.parameters.set('jwt', result.response);

      return true;

    });

  }

  createLead(){

    du.debug('Create Lead');

  }

  createOrder(){

    du.debug('Create Order');

  }

  confirmOrder(){

    du.debug('Confirm Order');

  }

}



const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

const TransactionHelperController = global.SixCRM.routes.include('helpers', 'entities/transaction/Transaction.js');
const SessionHelperController = global.SixCRM.routes.include('helpers', 'entities/session/Session.js');
const SessionController = global.SixCRM.routes.include('entities', 'Session.js');
const transactionEndpointController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');

module.exports = class ConfirmOrderController extends transactionEndpointController{

  constructor(){

    super();

    this.required_permissions = [
      'user/read',
      'account/read',
      'session/create',
      'session/read',
      'session/update',
      'campaign/read',
      'creditcard/create',
      'creditcard/update',
      'creditcard/read',
      'productschedule/read',
      'merchantprovidergroup/read',
      'merchantprovidergroupassociation/read',
      'product/read',
      'affiliate/read',
      'transaction/read',
      'rebill/read',
      'notifications/create',
      'tracker/read'
    ];

    this.notification_parameters = {
      type: 'session',
      action: 'closed',
      title: 'Completed Session',
      body: 'A customer has completed a session.'
    };

    this.parameter_definitions = {
      execute: {
        required : {
          event:'event'
        }
      }
    };

    this.parameter_validation = {
      'event':global.SixCRM.routes.path('model', 'endpoints/confirmOrder/event.json'),
      'session':global.SixCRM.routes.path('model', 'entities/session.json'),
      'customer':global.SixCRM.routes.path('model', 'entities/customer.json'),
      'campaign': global.SixCRM.routes.path('model', 'entities/campaign.json'),
      'transactionproducts':global.SixCRM.routes.path('model', 'endpoints/components/transactionproducts.json'),
      'transactions':global.SixCRM.routes.path('model', 'endpoints/components/transactions.json'),
      'response':global.SixCRM.routes.path('model', 'endpoints/confirmOrder/response.json')
    };

    this.transactionHelperController = new TransactionHelperController();
    this.sessionHelperController = new SessionHelperController();

    this.sessionController = new SessionController();

    this.event_type = 'confirm';

    this.initialize();

  }

  execute(event){

    du.debug('Execute');

    return this.preamble(event)
    .then(() => this.confirmOrder());

  }

  confirmOrder(){

    du.debug('Confirm Order');

    return this.hydrateSession()
    .then(() => this.validateSession())
    .then(() => this.hydrateSessionProperties())
    .then(() => this.closeSession())
    .then(() => this.buildResponse())
    .then(() => this.postProcessing())
		.then(() => {

      return this.parameters.get('response');

    });

  }

  hydrateSession(){

    du.debug('Hydrate Session');

    let event = this.parameters.get('event');

    return this.sessionController.get({id: event.session}).then(session => {

      this.parameters.set('session', session);
      return true;

    });

  }

  validateSession(){

    du.debug('Validate Session');

    let session = this.parameters.get('session');

    if(this.sessionHelperController.isComplete({session: session})){
      eu.throwError('bad_request', 'The specified session is already complete.');
    }

    return Promise.resolve(true);

  }

  hydrateSessionProperties(){

    du.debug('Hydrate Session Properties');

    let session = this.parameters.get('session');

    let promises = [
      this.sessionController.getCustomer(session),
      this.sessionController.listTransactions(session),
      this.sessionController.getCampaign(session)
    ];

    return Promise.all(promises).then(promises => {

      this.parameters.set('customer', promises[0]);
      this.parameters.set('transactions', promises[1]);
      this.parameters.set('campaign', promises[2]);

      return true;

    })
    .then(() => this.setTransactionProducts());

  }

  setTransactionProducts(){

    du.debug('Set Transaction Products');

    let transactions = this.parameters.get('transactions');

    let transaction_products = this.transactionHelperController.getTransactionProducts(transactions);

    this.parameters.set('transactionproducts', transaction_products);

    return Promise.resolve(true);

  }


  closeSession(){

    du.debug('Confirm Order');

    let session = this.parameters.get('session');

    return this.sessionController.closeSession(session).then(() => {

      return true;

    });

  }

  buildResponse(){

    du.debug('Build Response');

    let session = this.parameters.get('session');
    let customer = this.parameters.get('customer');
    let transactions = this.parameters.get('transactions');
    let transaction_products = this.parameters.get('transactionproducts');

    this.parameters.set('response', {
      session:session,
      customer: customer,
      transactions: transactions,
      transaction_products: transaction_products
    });

    return Promise.resolve(true);

  }

  postProcessing(){

    du.debug('Post Processing');

    return this.pushEvent();

  }

}

'use strict';
const _ = require("underscore");
const Validator = require('jsonschema').Validator;

const du = global.routes.include('lib', 'debug-utilities.js');

var sessionController = global.routes.include('controllers', 'entities/Session.js');
const transactionEndpointController = global.routes.include('controllers', 'endpoints/transaction.js');

class confirmOrderController extends transactionEndpointController{

    constructor(){
        super({
            required_permissions: [
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
                'loadbalancer/read',
                'product/read',
                'affiliate/read',
                'transaction/read',
                'rebill/read',
                'notifications/create',
                'tracker/read'
            ],
            notification_parameters: {
                type: 'session',
                action: 'closed',
                title: 'Completed Session',
                body: 'A customer has completed a session.'
            }
        });

    }

    execute(event){

        return this.preprocessing(event)
			.then((event) => this.acquireQuerystring(event))
			.then((event) => this.validateInput(this.queryString, this.validateEventSchema))
			.then(this.confirmOrder)
      .then((result_object) => this.pushToRedshift(result_object))
			.then((results) => this.handleNotifications(results));

    }

    validateEventSchema(querystring){

        du.debug('Validate Event Schema');

        let confirm_order_schema = global.routes.include('model', 'endpoints/confirmorder');

        let v = new Validator();

        return v.validate(querystring, confirm_order_schema);

    }

    confirmOrder (querystring) {

        du.debug('Confirm Order');

        var promises = [];

        return sessionController.get(querystring['session']).then((session) => {

            if(_.isNull(session)){ throw new Error('The specified session is unavailable.'); }
            if(session.completed == 'true'){ throw new Error('The specified session is already complete.'); }

            var getCustomer = sessionController.getCustomer(session);
            var getTransactions = sessionController.getTransactions(session);
            var getTransactionProducts = sessionController.getTransactionProducts(session);

            promises.push(getCustomer);
            promises.push(getTransactions);
            promises.push(getTransactionProducts);

            return Promise.all(promises).then((promises) => {

                var customer = promises[0];
                var transactions = promises[1];
                var transaction_products = promises[2];

                return sessionController.closeSession(session).then(() => {

                    var results = {session: session, customer: customer, transactions: transactions, transaction_products: transaction_products};

                    return results;

                });


            });

        });

    }

    pushToRedshift(results){

        du.debug('Push To Redshift');

        return this.pushEventToRedshift('confirm', results.session).then((result) => {

            du.debug(result);

            return results;

        });

    }

}

module.exports = new confirmOrderController();

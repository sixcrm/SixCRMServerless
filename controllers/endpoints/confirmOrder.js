'use strict';
const _ = require("underscore");
const querystring = require('querystring');

const du = global.routes.include('lib', 'debug-utilities.js');

var sessionController = global.routes.include('controllers', 'entities/Session.js');
var endpointController = global.routes.include('controllers', 'endpoints/endpoint.js');

class confirmOrderController extends endpointController{

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
                'notifications/create'
            ]
        });

        this.notification_parameters = {
            type: 'session',
            action: 'closed',
            title: 'Completed Session',
            body: 'A customer has completed a session.'
        };

    }

    execute(event){

        return this.preprocessing((event))
			.then(this.acquireQuerystring)
			.then(this.validateInput)
			.then(this.confirmOrder)
			.then((results) => this.handleNotifications(results));

    }

    acquireQuerystring(event){

        du.debug('Acquire Querystring');

        return new Promise((resolve, reject) => {

            var duplicate_querystring = event.queryStringParameters;

            if(!_.isObject(duplicate_querystring)){

                if(_.isString(duplicate_querystring)){

                    try{

                        duplicate_querystring = querystring.parse(duplicate_querystring);

                    }catch(error){

                        return reject(error);

                    }

                    resolve(duplicate_querystring);

                }else{

                    return reject(new Error('Request querystring is an unexpected format.'));

                }

            }else{

                return resolve(duplicate_querystring);

            }

        });

    }

    validateInput(querystring){

        du.debug('Validate Input');

        return new Promise((resolve, reject) => {

            if(!_.isObject(querystring) || !_.has(querystring, 'session_id')){

                return reject(new Error('The session_id must be set in the querystring.'));

            }

            return resolve(querystring);

        });

    }

    confirmOrder (querystring) {

        du.debug('Confirm Order');

        var promises = [];

        return sessionController.get(querystring['session_id']).then((session) => {

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

    handleNotifications(pass_through){

        du.warning('Handle Notifications');

        return this.issueNotifications(this.notification_parameters).then(() => pass_through);

    }

}

module.exports = new confirmOrderController();

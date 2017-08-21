'use strict';
const _ = require('underscore');

const du =  global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu =  global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities =  global.SixCRM.routes.include('lib', 'array-utilities.js');

const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

class customerController extends entityController {

    constructor(){

        super('customer');

        this.creditCardController = global.SixCRM.routes.include('controllers', 'entities/CreditCard.js');
        this.sessionController = global.SixCRM.routes.include('controllers', 'entities/Session.js');
        this.rebillController = global.SixCRM.routes.include('controllers', 'entities/Rebill.js');
        this.transactionController = global.SixCRM.routes.include('controllers', 'entities/Transaction.js');

    }

    getFullName(customer){

        du.debug('Get Full Name');

        let fullname = [];

        if(_.has(customer, 'firstname')){

            fullname.push(customer.firstname);

        }

        if(_.has(customer, 'lastname')){

            fullname.push(customer.lastname);

        }

        if(fullname.length > 0){

            return arrayutilities.compress(fullname, ' ', '');

        }

        return '';


    }

    getAddress(customer){

        return Promise.resolve(customer.address);

    }

    addCreditCard(customer, creditcard){

        du.debug('Add Credit Card');

        return new Promise((resolve, reject) => {

            if(!_.has(customer, 'id')){

                return this.get(customer).then((hydrated_customer) => {

                    return resolve(this.addCreditCard(hydrated_customer, creditcard));

                });

            }

            if(!_.has(creditcard, 'id')){

                return reject(eu.getError('bad_request','Invalid customer provided.'));

            }


            if(_.has(customer, 'creditcards')){

                if(_.isArray(customer.creditcards)){

                    if(_.contains(customer.creditcards, creditcard.id)){

                        return resolve(customer);

                    }else{

                        customer.creditcards.push(creditcard.id);

                        return this.update(customer).then((customer) => {

                            return resolve(customer);

                        }).catch((error) => {

                            return reject(error);

                        });

                    }

                }else{

                    return reject(eu.getError('bad_request','Unexpected customer structure.'));

                }


            }else{

                customer['creditcards'] = [creditcard.id];

                return this.update(customer).then((customer) => {

                    return resolve(customer);

                }).catch((error) => {

                    return reject(error);

                });

            }

        });

    }

    getCreditCards(customer){

        if(_.has(customer, "creditcards")){

            return customer.creditcards.map(id => this.creditCardController.get(id));

        }else{

            return null;

        }

    }

	// Technical Debt:  Clumsy, but functional...
    getCreditCardsPromise(customer){

        let promises = this.getCreditCards(customer);

        if(!_.isNull(promises)){

            return Promise.all(promises);

        }else{

            return Promise.resolve(null);

        }

    }


    getMostRecentCreditCard(customer_id){

        return new Promise((resolve, reject) => {

            this.get(customer_id).then((customer) => {

                if(!_.has(customer, 'id')){ return resolve(null); }

                this.getCreditCardsPromise(customer).then((credit_cards) => {

                    let most_recent = null;

                    if(_.isArray(credit_cards) && credit_cards.length > 0){

                        credit_cards.forEach((credit_card) => {

                            if(_.isNull(most_recent) && _.has(credit_card, 'updated_at')){

                                most_recent = credit_card;

                            }else{

                                if(_.has(credit_card, 'updated_at') && credit_card.updated_at > most_recent.updated_at){

                                    most_recent = credit_card;

                                }

                            }

                        });

                        if(!_.isNull(most_recent)){

                            return resolve(most_recent);

                        }

                    }

                    return reject(eu.getError('not_found','Unable to identify most recent credit card.'));

                });

            });

        });

    }

    getCustomerByEmail(email){

        return this.getBySecondaryIndex('email', email, 'email-index');

    }

    getCustomerSessions(customer){

        let customer_id = customer;

        if(_.has(customer, 'id')){

            customer_id = customer.id;

        }

        //Technical Debt:  Observe the inelegance of the below solution!
        if(!_.contains(_.functions(this.sessionController), 'getSessionByCustomerID')){

            this.sessionController = global.SixCRM.routes.include('controllers', 'entities/Session.js');

            return this.sessionController.getSessionByCustomerID(customer_id);

        }else{

            return this.sessionController.getSessionByCustomerID(customer_id);

        }

    }

    getCustomerRebills(customer){

        let customer_id = customer;

        if(_.has(customer, 'id')){

            customer_id = customer.id;

        }

        return this.getCustomerSessions(customer).then((sessions) => {

            let rebill_promises = sessions.map((session) => this.rebillController.getRebillsBySessionID(session.id));

            return Promise.all(rebill_promises);

        });

    }

    // Technical Debt: This method ignores cursor and limit, returns all. Implementing proper pagination is tricky since
    // we retrieve data in 3 steps (sessions first, then rebills for each session, then transaction for each session).
    listTransactionsByCustomer(customer, pagination){

        let customer_id = customer;

        if(_.has(customer, 'id')){

            customer_id = customer.id;

        }

        return this.getCustomerSessions(customer).then((sessions) => {

            du.debug('Get Customer Sessions');
            du.debug(sessions);

            let rebill_promises = sessions.map((session) => this.rebillController.getRebillsBySessionID(session.id));

            return Promise.all(rebill_promises).then((rebill_lists) => {

                let rebill_ids = [];

                rebill_lists = rebill_lists || [];

                rebill_lists.forEach((rebill_list) => {

                    let list = rebill_list || [];

                    list.forEach((rebill) => {
                        rebill_ids.push(rebill.id);
                    });
                });

                let transaction_promises = [];

                rebill_ids.forEach((rebill) => {
                    transaction_promises.push(this.transactionController.listBySecondaryIndex('rebill', rebill, 'rebill-index', pagination));
                });

                return Promise.all(transaction_promises).then(transaction_responses => {

                    let transactions = [];
                    let pagination = {};

                    transaction_responses.forEach((transaction_response) => {
                        transaction_response.transactions.forEach((transaction) => {
                            transactions.push(transaction);
                        });
                    });

                    pagination.count = transactions.length;
                    pagination.end_cursor = '';
                    pagination.has_next_page = false;

                    return {
                        transactions: transactions,
                        pagination: pagination
                    }

                });

            });

        });

    }

    listCustomerSessions(customer, pagination) {
        let customer_id = customer;

        if(_.has(customer, 'id')){

            customer_id = customer.id;

        }

        // Technical Debt:  Observe the inelegance of the below solution!
        // For some reason graph is unable to call 'listSessionsByCustomerID' unless we do this. Why?
        if(!_.contains(_.functions(this.sessionController), 'listSessionsByCustomerID')){

            this.sessionController = global.SixCRM.routes.include('controllers', 'entities/Session.js');

            return this.sessionController.listSessionsByCustomerID(customer_id, pagination);

        }else{

            return this.sessionController.listSessionsByCustomerID(customer_id, pagination);

        }

    }

    // Technical Debt: This method ignores cursor and limit, returns all. Implementing proper pagination is tricky since
    // we retrieve data in 2 steps (sessions first, then rebills for each session and combine the results).
    listCustomerRebills(customer, pagination) {
        return this.getCustomerSessions(customer).then((sessions) => {

            let rebill_promises = sessions.map((session) => this.rebillController.listRebillsBySessionID(session.id));

            return Promise.all(rebill_promises).then((rebill_lists) => {

                let rebills = [];
                let pagination = {};

                rebill_lists.forEach((rebill_list) => {
                    rebill_list.rebills.forEach((rebill) => {
                        rebills.push(rebill);
                    });
                });

                pagination.count = rebills.length;
                pagination.end_cursor = '';
                pagination.has_next_page = false;

                return {
                    rebills: rebills,
                    pagination: pagination
                }
            });

        });
    }
}

module.exports = new customerController();

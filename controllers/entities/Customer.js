'use strict';
const _ = require('underscore');

const du =  global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu =  global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities =  global.SixCRM.routes.include('lib', 'array-utilities.js');

const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

class customerController extends entityController {

    constructor(){

        super('customer');

    }

    listByCreditCardID({id, pagination}){

      du.debug('List By Credit Card ID')

      let scan_parameters = {
          filter_expression: 'contains(#f1, :credit_card_id)',
          expression_attribute_names:{
              '#f1': 'creditcards',
          },
          expression_attribute_values: {
              ':credit_card_id': id
          }
      };

      return this.scanByParameters({parameters: scan_parameters, pagination: pagination});

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

                return this.get({id: customer}).then((hydrated_customer) => {

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

                        return this.update({entity: customer}).then((customer) => {

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

                return this.update({entity: customer}).then((customer) => {

                    return resolve(customer);

                }).catch((error) => {

                    return reject(error);

                });

            }

        });

    }

    getCreditCards(customer){

        if(_.has(customer, "creditcards")){

          return arrayutilities.map(customer.creditcards, (id) => {

            return this.executeAssociatedEntityFunction('creditCardController', 'get', {id: id});

          });

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

            this.get({id: customer_id}).then((customer) => {

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

        return this.getBySecondaryIndex({field: 'email', index_value:email, index_name: 'email-index'});

    }

    getCustomerSessions(customer){

      du.debug('Get Customer Sessions');

      let customer_id = customer;

      if(_.has(customer, 'id')){

          customer_id = customer.id;

      }

      return this.executeAssociatedEntityFunction('sessionController', 'getSessionByCustomerID', customer_id);

    }

    getCustomerRebills(customer){

        let customer_id = customer;

        if(_.has(customer, 'id')){

            customer_id = customer.id;

        }

        return this.getCustomerSessions(customer).then((sessions) => {

          du.warning(sessions);  process.exit();

            if (!sessions) {
                return [];
            }

            let rebill_promises = arrayutilities.map(sessions, (session) => {
              return this.executeAssociatedEntityFunction('rebillController', 'listRebillsBySessionID', {id: this.getID(session)});
            });

            return Promise.all(rebill_promises);

        });

    }

    // Technical Debt: This method ignores cursor and limit, returns all. Implementing proper pagination is tricky since
    // we retrieve data in 3 steps (sessions first, then rebills for each session, then transaction for each session).
    //Technical Debt:  Please refactor.
    listTransactionsByCustomer(customer, pagination){

        du.debug('List Transactions By Customer');

        let customer_id = customer;

        if(_.has(customer, 'id')){

          customer_id = customer.id;

        }

        return this.getCustomerSessions(customer).then((sessions) => {

            if (!sessions) {
                return this.createEndOfPaginationResponse('transactions', []);
            }

            let rebill_promises = arrayutilities.map(sessions, (session) => {
              return this.executeAssociatedEntityFunction('rebillController', 'listRebillsBySessionID', {id: this.getID(session)});
            });

            return Promise.all(rebill_promises).then((rebill_lists) => {

                du.debug('Rebill lists are', rebill_lists);

                let rebill_ids = [];

                rebill_lists = rebill_lists || [];

                rebill_lists.forEach((rebill_list) => {

                  let list = rebill_list || [];

                  list.forEach((rebill) => {
                      rebill_ids.push(rebill.id);
                  });

                });

                let transaction_promises = arrayutilities.map(rebill_ids, (rebill) => {
                  return this.executeAssociatedEntityFunction('transactionController', 'listBySecondaryIndex', {field: 'rebill', index_value: rebill, index_name: 'rebill-index', pagination: pagination});
                });

                return Promise.all(transaction_promises).then(transaction_responses => {

                  let transactions = [];

                  transaction_responses = transaction_responses || [];

                  transaction_responses.forEach((transaction_response) => {

                    let transactions_from_response = transaction_response.transactions || [];

                    transactions_from_response.forEach((transaction) => {
                      if (transaction && _.has(transaction, 'id')) {
                        transactions.push(transaction);
                      } else {
                        du.warning('Invalid transaction', transaction);
                      }
                    });

                  });

                  return this.createEndOfPaginationResponse('transactions', transactions);

                });

            });

        });

    }

    listCustomerSessions(customer, pagination) {

      du.debug('List Customer Sessions');

      let customer_id = customer;

      if(_.has(customer, 'id')){

          customer_id = customer.id;

      }

      return this.executeAssociatedEntityFunction('sessionController', 'listSessionsByCustomerID', {id: customer_id, pagination: pagination});

    }

    // Technical Debt: This method ignores cursor and limit, returns all. Implementing proper pagination is tricky since
    // we retrieve data in 2 steps (sessions first, then rebills for each session and combine the results).
    listCustomerRebills(customer, pagination) {

      du.debug('List Customer Rebills');

        return this.getCustomerSessions(customer).then((sessions) => {

            if (!sessions) {
                return this.createEndOfPaginationResponse('rebills', []);
            }

            let rebill_promises = arrayutilities.map(sessions, (session) => {
              return this.executeAssociatedEntityFunction('rebillController', 'listRebillsBySessionID', {id: this.getID(session)});
            });

            return Promise.all(rebill_promises).then((rebill_lists) => {

                let rebills = [];

                rebill_lists = rebill_lists || [];

                rebill_lists.forEach((rebill_list) => {

                    let rebills_from_list = rebill_list.rebills || [];

                    rebills_from_list.forEach((rebill) => {
                        rebills.push(rebill);
                    });
                });

                return this.createEndOfPaginationResponse('rebills', rebills);

            });

        });
    }

    createEndOfPaginationResponse(items_name, items) {

        du.debug('Create End Of Pagination Response', items_name, items);

        let pagination = {};

        pagination.count = items.length;
        pagination.end_cursor = '';
        pagination.has_next_page = false;

        let response = {};

        response[items_name] = items;
        response['pagination'] = pagination;

        du.debug('Returning', response);

        return Promise.resolve(response);
    }
}

module.exports = new customerController();

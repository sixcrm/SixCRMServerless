'use strict';
const _ = require('underscore');

const du =  require('../lib/debug-utilities.js');

const entityController = require('./Entity.js');
const creditCardController = require('./CreditCard.js');


class customerController extends entityController {

    constructor(){
        super(process.env.customers_table, 'customer');
        this.table_name = process.env.customers_table;
        this.descriptive_name = 'customer';
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

                return reject(new Error('Invalid customer provided.'));

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

                    return reject(new Error('Unexpected customer structure.'));

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

            return customer.creditcards.map(id => creditCardController.get(id));

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

                    return reject(new Error('Unable to identify most recent credit card.'));

                });

            });

        });

    }

    getCustomerByEmail(email){

        return this.getBySecondaryIndex('email', email, 'email-index');

    }

}

module.exports = new customerController();

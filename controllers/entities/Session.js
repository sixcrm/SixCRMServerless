'use strict';
const _ = require('underscore');
const uuidV4 = require('uuid/v4');

var timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
var du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
var eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

class sessionController extends entityController {

    constructor(){

        super('session');

        this.session_length = 3600;
        this.affiliate_fields = [
            'affiliate',
            'subaffiliate_1',
            'subaffiliate_2',
            'subaffiliate_3',
            'subaffiliate_4',
            'subaffiliate_5',
            'cid'
        ];

    }

    listSessionsByAffiliate(affiliate, pagination){

        du.debug('List Sessions By Affiliate');

        affiliate = this.getID(affiliate);

        let scan_parameters = {
            filter_expression: '#f1 = :affiliate_id or #f2 = :affiliate_id OR #f3 = :affiliate_id OR #f4 = :affiliate_id OR #f5 = :affiliate_id OR #f6 = :affiliate_id OR #f7 = :affiliate_id',
            expression_attribute_names:{
                '#f1': 'affiliate',
                '#f2': 'subaffiliate_1',
                '#f3': 'subaffiliate_2',
                '#f4': 'subaffiliate_3',
                '#f5': 'subaffiliate_4',
                '#f6': 'subaffiliate_5',
                '#f7': 'cid'
            },
            expression_attribute_values: {
                ':affiliate_id': affiliate
            }
        };

        return this.scanByParameters(scan_parameters, pagination);

    }

    getCustomer(session){

      du.debug('Get Customer');

      if(!_.has(session, "customer")){ return null; }

      return this.executeAssociatedEntityFunction('customerController', 'get', session.customer);

    }

    getCampaign(session){

      du.debug('Get Campaign');

      if(!_.has(session, "campaign")){ return null; }

      return this.executeAssociatedEntityFunction('campaignController', 'get', session.campaign);

    }

    getSessionCreditCard(session){

      du.debug('Get Session Credit Card');

      if(!_.has(session, 'customer')){ return null; }

      return this.executeAssociatedEntityFunction('customerController', 'getMostRecentCreditCard', session.customer);

    }

    getCampaignHydrated(session){

      du.debug('Get Campaign Hydrated');

      var id = session;

      if(_.has(session, "id")){
          id = session.id;
      }

      return this.executeAssociatedEntityFunction('campaignController', 'getHydratedCampaign', id);

    }

    getAffiliate(session, affiliate_field){

        du.debug('Get Affiliate');

        if(_.has(session, affiliate_field) && this.isUUID(session[affiliate_field])){

          return this.executeAssociatedEntityFunction('affiliateController', 'get', session[affiliate_field]);

        }else{

          return null;

        }

    }

    getAffiliateIDs(session){

        du.debug('Get Affiliate IDs');

        return this.get(session).then((session) => {

            let affiliate_ids = [];

            this.affiliate_fields.forEach((affiliate_field) => {

                if(_.has(session, affiliate_field)){

                    if(this.isUUID(session[affiliate_field])){

                        affiliate_ids.push(session[affiliate_field]);

                    }else{

                        du.warning('Unrecognized affiliate field type: '+session[affiliate_field]);

                    }

                }

            });

            return affiliate_ids;

        });

    }

    getAffiliates(session){

        du.debug('Get Affiliates');

        return new Promise((resolve) => {

            return this.get(session).then((session) => {

                let affiliates = [];

                this.affiliate_fields.forEach((affiliate_field) => {

                    if(_.has(session, affiliate_field)){

                        if(this.isUUID(session[affiliate_field])){

                          affiliates.push(this.executeAssociatedEntityFunction('affiliateController', 'get', session[affiliate_field]));

                        }else{

                            du.warning('Unrecognized affiliate field type: '+session[affiliate_field]);

                        }

                    }

                });

                if(affiliates.length < 1){ return resolve(affiliates); }

                return Promise.all(affiliates).then((affiliates) => {

                    return resolve(affiliates);

                });

            });

        });

    }

	//used in Create Order
    getTransactions(session){

        return new Promise((resolve, reject) => {

            var session_transactions = [];

            return this.executeAssociatedEntityFunction('rebillController', 'getRebillsBySessionID', session.id).then((rebills) => {

                return Promise.all(rebills.map((rebill) => {

                    return new Promise((resolve, reject) => {

                      return this.executeAssociatedEntityFunction('transactionController', 'getTransactionsByRebillID', rebill.id).then((transactions) => {

                            if(_.isNull(transactions)){

                                return resolve(null);

                            }else{

                                transactions.map((transaction) => {

                                    session_transactions.push(transaction)

                                });

                                return resolve(transactions);

                            }

                        }).catch((error) => {

                            return reject(error)

                        });

                    });

                })).then(() => {

                    return resolve(session_transactions);

                }).catch((error) => {

                    return reject(error);

                });

            }).catch((error) => {

                return reject(error);

            });

        });

    }

    getRebills(session){

      return this.executeAssociatedEntityFunction('rebillController', 'getRebillsBySessionID', session.id)

    }

    getProductSchedules(session){

        if(!_.has(session, "product_schedules")){ return null; }

        return session.product_schedules.map(schedule => this.executeAssociatedEntityFunction('productScheduleController', 'get', schedule));

    }

	   //Technical Debt: This function is a mess...
    getTransactionProducts(session){

        var controller_instance = this;

        return new Promise((resolve, reject) => {

            var session_products = [];

            return controller_instance.getRebills(session).then((rebills) => {

                return Promise.all(rebills.map((rebill) => {

                    return new Promise((resolve, reject) => {

                      return this.executeAssociatedEntityFunction('rebillController', 'getTransactions', rebill).then((transactions) => {

							//note that at the time of a createorder, there are lots of rebills, only one of which has a transaction
                            if(_.isNull(transactions)){

                                return resolve([]);

                            }else{

                                return Promise.all(transactions.map((transaction) => {

                                    return new Promise((resolve) => {

                                      return this.executeAssociatedEntityFunction('transactionController', 'getProducts', transaction).then((products) => {

                                          return resolve(products);

                                      });

                                    });

                                })).then((products) => {

                                    return resolve(products);

                                }).catch((error) => {

                                    return reject(error);

                                });

                            }

                        });

                    });

                })).then((products) => {

                    products.forEach((c1) => {

                        c1.forEach((c2) => {

                            c2.forEach((product) => {

                                session_products.push(product);

                            });
                        });
                    });

                    return resolve(session_products);

                }).catch((error) => {
                    return reject(error);
                });

            }).catch((error) => {
                return reject(error);
            });

        });

    }

    getSessionHydrated(id){

        return this.get(id).then((session) => {

            return this.hydrate(session);

        });

    }

	//Technical Debt:  This needs to move to a prototype?
    hydrate(session){

        return new Promise((resolve) => {

            if(!_.has(session, "campaign")){ return null; }

            this.getCampaignHydrated(session.campaign).then((campaign) => {

                session.campaign = campaign;

                return session;

            }).then((session) => {

                if(!_.has(session, "customer")){ return null; }

                return this.getCustomer(session).then((customer) => {

                    session.customer = customer;

                    return session;

                }).then((session) => {

                    return resolve(session);

                }).catch((error) => {

                    throw error;

                });

            }).catch((error) => {

                throw error;

            });

        });

    }

    createSessionObject(params){

        if(!_.has(params,'customer')){

            return eu.getError('bad_request','A session must be associated with a Customer.');

        }

        if(!_.has(params,'campaign')){

            return eu.getError('bad_request','A session must be associated with a Campaign.');

        }

        var session = {
            id: uuidV4(),
            customer: params.customer,
            campaign: params.campaign,
            completed: 'false'
        };

        if(_.has(params, 'affiliate_id') && _.isString(params.affiliate_id)){
            session.affiliate = params.affiliate_id;
        }

        return session;

    }

    getSessionByCustomerID(customer_id){

        return this.queryBySecondaryIndex('customer', customer_id, 'customer-index').then((result) => this.getResult(result));

    }

    listSessionsByCustomerID(customer_id, pagination) {

        return this.listBySecondaryIndex('customer', customer_id, 'customer-index', pagination);

    }

    //Technical Debt:  Update me!
    putSession(parameters){

        return new Promise((resolve, reject) => {

            if(!_.has(parameters, 'customer')){
                reject(eu.getError('bad_request','Parameters object must have a customer'));
            }

            if(!_.has(parameters, 'campaign')){
                reject(eu.getError('bad_request','Parameters object must have a customer'));
            }

            /*
            //Technical Debt:  This assures the presence of fields that we don't necessarily need...
            ['affiliate', 'subaffiliate_1', 'subaffiliate_2', 'subaffiliate_3', 'subaffiliate_4', 'subaffiliate_5'].forEach((affiliate_field) => {

                if(!_.has(parameters, affiliate_field)){
                    parameters[affiliate_field] = null;
                }

            });
            */


            return this.getSessionByCustomerID(parameters.customer).then((sessions) => {

                var session_found = false;

                if(_.isArray(sessions) && sessions.length > 0){
                    sessions.forEach((session) => {
                        if(_.has(session, 'completed') && session.completed == 'false'){
                            if(_.has(session, "created_at")){
                                let created_at_timestamp = timestamp.dateToTimestamp(session.created_at);
                                var time_difference = timestamp.getTimeDifference(created_at_timestamp);

                                if(time_difference < this.session_length){
                                    resolve(session);
                                    session_found = true;
                                    return false;
                                }
                            }
                        }
                    });
                }

                if(session_found == false){

                    let session = {};

                    _.union(['customer', 'campaign'], this.affiliate_fields).forEach((parameter) => {
                        if(_.has(parameters, parameter)){
                            session[parameter] = parameters[parameter];
                        }else{

                            //Technical Debt:  Some of this stuff is not necessary...
                            //session[parameter] = null;

                        }

                    });

                    return this.create(session).then((session) => {
                        return resolve(session);
                    });

                } else {
                    return reject(eu.getError('not_found',`Session with CustomerID '${parameters.customer}' not found`));
                }

            }).catch((error) => {

                return reject(error);

            });

        });

    }

    updateSessionProductSchedules(session, product_schedules){

        var session_product_schedules = session.product_schedules;

        var purchased_product_schedules = [];

        product_schedules.forEach((schedule) => {
            purchased_product_schedules.push(schedule.id);
        });

        session_product_schedules = _.union(purchased_product_schedules, session_product_schedules);

        session.product_schedules = session_product_schedules;

        return this.update(session);

    }

    closeSession(session){

        session.completed = 'true';

        return this.update(session);

    }

    validateProductSchedules(product_schedules, session){

        if(!_.has(session, 'product_schedules') || !_.isArray(session.product_schedules) || session.product_schedules.length < 1){

            return true;

        }

        for(var i = 0; i < product_schedules.length; i++){
            var product_schedule_id = product_schedules[i].id;

            for(var j = 0; j < session.product_schedules.length; j++){
                if(_.isEqual(product_schedule_id, session.product_schedules[j])){
                    eu.throwError('bad_request','Product schedule already belongs to this session');
                }
            }
        }

        return true;

    }

}

module.exports = new sessionController();

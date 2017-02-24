'use strict';
const _ = require('underscore');
const uuidV4 = require('uuid/v4');

var dynamoutilities = require('../lib/dynamodb-utilities.js');
var timestamp = require('../lib/timestamp.js');

var productScheduleController = require('./ProductSchedule.js');
var rebillController = require('./Rebill.js');
var customerController = require('./Customer.js');
var transactionController = require('./Transaction.js');
var campaignController = require('./Campaign.js');
var entityController = require('./Entity.js');

class sessionController extends entityController {

	constructor(){
		super(process.env.sessions_table, 'session');
		this.table_name = process.env.sessions_table;
		this.descriptive_name = 'session';

		this.session_length = 3600;

	}

	getCustomer(session){

		if(!_.has(session, "customer")){ return null; }

		return customerController.get(session.customer);

	}

	getCampaign(session){

		if(!_.has(session, "campaign")){ return null; }


		return campaignController.get(session.campaign);

	}

	getCampaignHydrated(session){

		var id = session;
		if(_.has(session, "id")){
			id = session.id;
		}
		return campaignController.getHydratedCampaign(id);

	}

	//used in Create Order
	getTransactions(session){

		return new Promise((resolve, reject) => {

			var session_transactions = [];

			rebillController.getRebillsBySessionID(session.id).then((rebills) => {

				Promise.all(rebills.map((rebill) => {

					return new Promise((resolve, reject) => {

						transactionController.getTransactionsByRebillID(rebill.id).then((transactions) => {

							if(_.isNull(transactions)){

								resolve(null);

							}else{

								transactions.map((transaction) => {

									session_transactions.push(transaction)

								});

								resolve(transactions);

							}

						}).catch((error) => {

							reject(error)

						});

					});

				})).then((transactions) => {

					resolve(session_transactions);

				}).catch((error) => {

					reject(error);

				});

			}).catch((error) => {

				reject(error);

			});

		});

	}

	getRebills(session){

		return rebillController.getRebillsBySessionID(session.id);

	}

	getProductSchedules(session){

		if(!_.has(session, "product_schedules")){ return null; }

		return session.product_schedules.map(schedule => productScheduleController.get(schedule));

	}

	getTransactionProducts(session){

		var controller_instance = this;

		return new Promise((resolve, reject) => {

			var session_products = [];

			controller_instance.getRebills(session).then((rebills) => {

				Promise.all(rebills.map((rebill) => {

					return new Promise((resolve, reject) => {

						rebillController.getTransactions(rebill).then((transactions) => {

							//note that at the time of a createorder, there are lots of rebills, only one of which has a transaction
							if(_.isNull(transactions)){

								resolve([]);

							}else{

								Promise.all(transactions.map((transaction) => {

									return new Promise((resolve, reject) => {

										transactionController.getProducts(transaction).then((products) => {

											resolve(products);

										});

									});

								})).then((products) => {

									resolve(products);

								}).catch((error) => {

									reject(error);

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

					resolve(session_products);

				}).catch((error) => {
					reject(error);
				});

			}).catch((error) => {
				reject(error);
			});

		}).catch((error) => {
			reject(error);
		});

	}

	getSessionHydrated(id){

		return new Promise((resolve, reject) => {

			this.get(id).then((session) => {

				this.hydrate(session).then((session) => {

					resolve(session);

				}).catch((error) => {

					reject(error);

				});

			});


        });

	}

	//Technical Debt:  This needs to move to a prototype
	hydrate(session){

		var controller_instance = this;

		return new Promise((resolve, reject) => {

			if(!_.has(session, "campaign")){ return null; }

			controller_instance.getCampaignHydrated(session.campaign).then((campaign) => {

				session.campaign = campaign;

				return session;

			}).then((session) => {

				if(!_.has(session, "customer")){ return null; }

				controller_instance.getCustomer(session).then((customer) => {

					session.customer = customer;

					return session;

				}).then((session) => {

					resolve(session);

				}).catch((error) => {

					throw error;

				});

			}).catch((error) => {

				throw error;

			});

		});

	}

	createSessionObject(params){

		if(!_.has(params,'customer_id')){

			return new Error('A session must be associated with a Customer ID.');

		}

		if(!_.has(params,'campaign_id')){

			return new Error('A session must be associated with a Campaign ID.');

		}

		var session = {
			id: uuidV4(),
			customer: params.customer_id,
			campaign: params.campaign_id,
			completed: 'false',
			created: timestamp.createTimestampSeconds(),
			modified: 'false'
		};

		if(_.has(params, 'affiliate_id') && _.isString(params.affiliate_id)){
			session.affiliate = params.affiliate_id;
		}

		return session;

	}

	//Technical Debt:  This needs to use a Entity method
	getSessionByCustomerID(customer_id){

		return this.listBySecondaryIndex('customer', customer_id, 'customer-index');

	}

	putSession(parameters, callback){

		var controller_instance = this;

		return new Promise((resolve, reject) => {

			if(!_.has(parameters, 'customer_id')){
				reject(new Error('Parameters object must have a customer_id'));
			}

			if(!_.has(parameters, 'campaign_id')){
				reject(new Error('Parameters object must have a customer_id'));
			}

			if(!_.has(parameters, 'affiliate_id')){
				parameters.affiliate_id = null;
			}

			this.getSessionByCustomerID(parameters.customer_id).then((sessions) => {

				var session_found = false;

				if(_.isArray(sessions) && sessions.length > 0){
					sessions.forEach((session) => {
						if(_.has(session, 'completed') && session.completed == 'false'){
							if(_.has(session, "created")){
								var time_difference = timestamp.getTimeDifference(session.created);
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

					var session = controller_instance.createSessionObject({
						customer_id: parameters.customer_id,
						campaign_id: parameters.campaign_id,
						affiliate_id: parameters.affiliate_id
					});

					this.create(session).then((session) => {

						resolve(session);

					});

				}

			}).catch((error) => {

				reject(error);

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
		session.modified = timestamp.createTimestampSeconds().toString();

		return this.update(session);

	}

	closeSession(session){

		session.completed = 'true';

		session.modified = timestamp.createTimestampSeconds().toString();

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
					throw new Error('Product schedule already belongs to this session');
				}
			}
		}

		return true;

	}

}

module.exports = new sessionController();

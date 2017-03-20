'use strict';
const _ = require('underscore');
const uuidV4 = require('uuid/v4');

var dynamoutilities = require('../lib/dynamodb-utilities.js');
var sqsutilities = require('../lib/sqs-utilities.js');
var timestamp = require('../lib/timestamp.js');
var transactionController = require('./Transaction.js');
var productScheduleController = require('./ProductSchedule.js');
var productController = require('./Product.js');
var sessionController = require('./Session.js');
var entityController = require('./Entity.js');

class rebillController extends entityController {

	constructor(){
		super(process.env.rebills_table, 'rebill');
		this.table_name = process.env.rebills_table;
		this.descriptive_name = 'rebill';
	}
	
	//Note: rebills don't get product associations, only product schedules
	getProducts(rebill){
		
		if(!_.has(rebill, 'products')){ return null; }
		
		return rebill.products.map(id => productController.get(id));
        
	}
	
	getProductSchedules(rebill){
		
		if(!_.has(rebill, 'product_schedules')){ return null; }
		
		return new Promise((resolve, reject) => {
			
			var promises = [];
			
			rebill.product_schedules.map((id) => {
				promises.push(productScheduleController.get(id));
			});
			
			Promise.all(promises).then((promises) => {
				
				resolve(promises);
				
			});
			
		});
        
	}
	
	getTransactions(rebill){
		
		return transactionController.getTransactionsByRebillID(rebill.id);
        
	}
	
	getParentSession(rebill){
		
		if(!_.has(rebill, 'parentsession')){ return null; }
		
		//why is this necessary?
		var sessionController = require('./Session.js');

		return sessionController.get(rebill.parentsession);
		
	}
	
	getParentSessionHydrated(rebill){
	
		if(!_.has(rebill, 'parentsession')){ return null; }
		
		return sessionController.getSessionHydrated(rebill.parentsession);
		
	}

	
	buildRebillObject(parameters){
		
		return {
			id: uuidV4(),
			billdate: parameters.billdate,
			parentsession: parameters.parentsession,
			product_schedules: parameters.product_schedules,
			amount: parameters.amount
		};
		
	}

    /**
	 * Returns difference in days from now to given time.
     * @param session_start Given time.
     * @returns {number}
     */
	calculateDateInCycle(session_start){
		
		var time_difference = timestamp.getTimeDifference(session_start);
	
		var day_in_cycle = Math.floor((time_difference / 86400));
		
		return day_in_cycle;
		
	}
	
	//validate this logic with product owner
	calculateRebill(day_in_cycle, product_schedule){
		
		var calculated_rebill;
		
		product_schedule.schedule.forEach((scheduled_product) => {
				
			if(parseInt(day_in_cycle) >= parseInt(scheduled_product.start)){
				
				if(!_.has(scheduled_product, "end") || (parseInt(day_in_cycle) < parseInt(scheduled_product.end))){
					
					var billdate = timestamp.createTimestampSeconds() + (scheduled_product.period * 86400);
					
					calculated_rebill = {product: scheduled_product.product_id, billdate: billdate, amount: scheduled_product.price, product_schedule: product_schedule};
					
					return true;
						
				}
				
			}
			
		});
		
		if(_.isObject(calculated_rebill)){
		
			return calculated_rebill;
			
		}
		
		return false;
		
	}
	
	//this is a lambda entrypoint
	createRebills(session, product_schedules, day_in_cycle){
		
		return Promise.all(product_schedules.map(schedule => this.createRebill(session, schedule, day_in_cycle)));
		
	}
	
	//Technical Debt:  This is a mess
	//the product schedule needs to be a part of the rebill, not the product
	createRebill(session, product_schedule, day_in_cycle){
	
		return new Promise((resolve, reject) => {
			
			if(!_.isNumber(day_in_cycle)){
				
				day_in_cycle = this.calculateDateInCycle(session.created);
				
			}
			
			var rebill_parameters = this.calculateRebill(day_in_cycle, product_schedule);
			
			var rebill_object = this.buildRebillObject({
				parentsession: session.id,
				billdate: rebill_parameters.billdate,
				product_schedules: [product_schedule.id],
				amount: rebill_parameters.amount
			});
			
			this.create(rebill_object).then((rebill) => {
			
				resolve(rebill);
				
			}).catch((error) => {
				
				reject(error);
				
			});
			
		});
			
	}
	
	addRebillToQueue(rebill, queue_name){
		
		return new Promise((resolve, reject) => {
			
			var queue_url = '';
			
			switch(queue_name){
				
				case 'bill':
					queue_url = process.env.bill_queue_url;
					break;
				case 'billfailure':
					queue_url = process.env.bill_failed_queue_url;
					break;
				case 'hold':
					queue_url = process.env.hold_queue_url;
					break;
				default:
					reject(new Error('Bad queue name.'));
					break;
				
			}
			
			sqsutilities.sendMessage({message_body: JSON.stringify(rebill), queue_url: queue_url}, (error, data) =>{
				
				if(_.isError(error)){ reject(error);}
				
				this.markRebillProcessing(rebill).then((rebill) => {
			
					resolve(rebill);
					
				}).catch((error) => {
				
					reject(error);
				
				});
			
			});
			
		});
		
	}
        
	getRebillsBySessionID(id){
		
		return this.listBySecondaryIndex('parentsession', id, 'parentsession-index');
		
	}
	
	markRebillProcessing(rebill){
		
		rebill.processing = "true";
		
		return this.update(rebill);
		
	}
	
	//Technical Debt:  This shouldn't go here...
	getRebillsAfterTimestamp(timestamp){
		
		return new Promise((resolve, reject) => {
			
			var query_parameters = {filter_expression: 'billdate < :timestampv AND processing <> :processingv', expression_attribute_values: {':timestampv':timestamp, ':processingv':'true'}};
			
			if(typeof cursor  !== 'undefined'){
				query_parameters.ExclusiveStartKey = cursor;
			}

			if(typeof limit  !== 'undefined'){
				query_parameters['limit'] = limit;
			}
			
			dynamoutilities.scanRecords(process.env.rebills_table, query_parameters, (error, data) => {

				if(_.isError(error)){ 
					reject(error);
				}
				
				if(_.isArray(data)){
					resolve(data);
				}
	
			});
	
		});
		
	}
	
	sendMessageAndMarkRebill(rebill){

		return new Promise((resolve, reject) => {
			
			sqsutilities.sendMessage({message_body: JSON.stringify(rebill), queue_url: process.env.bill_queue_url}, (error, data) =>{
				
				if(_.isError(error)){ reject(error);}
				
				this.markRebillProcessing(rebill).then((rebill) => {
			
					resolve(rebill);
					
				}).catch((error) => {
				
					reject(error);
				
				});
			
			});
	
		});
		
	}
	
	updateRebillTransactions(rebill, transactions){
		
		var rebill_transactions = [];
			
		if(_.has(rebill, "transactions") && _.isArray(rebill.transactions)){
			rebill_transactions = rebill.transactions;
		}
		
		rebill_transactions = _.union(rebill.transactions, transactions);
		
		rebill.transactions = rebill_transactions;
		
		rebill.modified = timestamp.createTimestampSeconds().toString();
			
		return this.update(rebill);
		
	}
		
}

module.exports = new rebillController();

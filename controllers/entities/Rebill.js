'use strict';
const _ = require('underscore');
const uuidV4 = require('uuid/v4');

//Technical Debt:  We shouldn't need the AWS utility classes here...
const dynamoutilities = global.SixCRM.routes.include('lib', 'dynamodb-utilities.js');
const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

var transactionController = global.SixCRM.routes.include('controllers', 'entities/Transaction.js');
var productScheduleController = global.SixCRM.routes.include('controllers', 'entities/ProductSchedule.js');
var productController = global.SixCRM.routes.include('controllers', 'entities/Product.js');
var sessionController = global.SixCRM.routes.include('controllers', 'entities/Session.js');
var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

const oneDayInSeconds = 86400;

class rebillController extends entityController {

    constructor(){
        super('rebill');
    }

	//Note: rebills don't get product associations, only product schedules
    getProducts(rebill){

        if(!_.has(rebill, 'products')){ return null; }

        return rebill.products.map(id => productController.get(id));

    }

    getProductSchedules(rebill) {

        if(!_.has(rebill, 'product_schedules')){ return null; }

        var promises = [];

        rebill.product_schedules.map((id) => {
            promises.push(productScheduleController.get(id));
        });

        return Promise.all(promises);

    }

    getTransactions(rebill){

        return transactionController.getTransactionsByRebillID(rebill.id);

    }

    getParentSession(rebill){

        if(!_.has(rebill, 'parentsession')){ return null; }

		//why is this necessary?
        var sessionController = global.SixCRM.routes.include('controllers', 'entities/Session.js');

        return sessionController.get(rebill.parentsession);

    }

    getParentSessionHydrated(rebill){

        if(!_.has(rebill, 'parentsession')){ return null; }

        return sessionController.getSessionHydrated(rebill.parentsession);

    }


    buildRebillObject(parameters){

        let rebill_object = {
            id: uuidV4(),
            bill_at: parameters.bill_at,
            parentsession: parameters.parentsession,
            product_schedules: parameters.product_schedules,
            amount: parameters.amount
        };

        return rebill_object;

    }

    calculateDayInCycle(session_start){

        return timestamp.getDaysDifference(session_start);

    }

	//validate this logic with product owner
    calculateRebill(day_in_cycle, product_schedule){

        du.info(day_in_cycle, product_schedule);

        var calculated_rebill;

        product_schedule.schedule.forEach((scheduled_product) => {

            if(parseInt(day_in_cycle) >= parseInt(scheduled_product.start)){

                if(!_.has(scheduled_product, "end") || (parseInt(day_in_cycle) < parseInt(scheduled_product.end))){

                    let bill_timestamp = timestamp.createTimestampSeconds() + (scheduled_product.period * oneDayInSeconds);

                    let bill_at = timestamp.toISO8601(bill_timestamp);

                    calculated_rebill = {
                        product: scheduled_product.product_id,
                        bill_at: bill_at,
                        amount: scheduled_product.price,
                        product_schedule: product_schedule
                    };

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

        if(!_.isNumber(day_in_cycle)){

            day_in_cycle = this.calculateDayInCycle(session.created);

        }

        var rebill_parameters = this.calculateRebill(day_in_cycle, product_schedule);

        var rebill_object = this.buildRebillObject({
            parentsession: session.id,
            bill_at: rebill_parameters.bill_at,
            product_schedules: [product_schedule.id],
            amount: rebill_parameters.amount
        });

        return this.create(rebill_object);

    }

    addRebillToQueue(rebill, queue_name){

        return new Promise((resolve, reject) => {

            var queue_shortname = '';

            switch(queue_name){

            case 'bill':
                queue_shortname = process.env.bill_queue;
                break;
            case 'billfailure':
                queue_shortname = process.env.bill_failed_queue;
                break;
            case 'hold':
                queue_shortname = process.env.hold_queue;
                break;
            default:
                reject(eu.getError('server','Bad queue name.'));
                break;

            }

            return sqsutilities.sendMessage({message_body: JSON.stringify(rebill), queue: queue_shortname}, (error) =>{

                if(_.isError(error)){ reject(error);}

                this.markRebillProcessing(rebill).then((rebill) => {

                    return resolve(rebill);

                }).catch((error) => {

                    return reject(error);

                });

            });

        });

    }

    getRebillsBySessionID(id){

        return this.queryBySecondaryIndex('parentsession', id, 'parentsession-index').then((result) => this.getResult(result));

    }

    listRebillsBySessionID(id, pagination){

        return this.listBySecondaryIndex('parentsession', id, 'parentsession-index', pagination);

    }

    markRebillProcessing(rebill){

        rebill.processing = "true";

        return this.update(rebill);

    }

	//Technical Debt:  This shouldn't go here...
    getRebillsAfterTimestamp(a_timestamp){

        return new Promise((resolve, reject) => {

            let timestamp_iso8601 = timestamp.toISO8601(a_timestamp);

            var query_parameters = {filter_expression: 'bill_at < :timestamp_iso8601v AND processing <> :processingv', expression_attribute_values: {':timestamp_iso8601v':timestamp_iso8601, ':processingv':'true'}};

			/* eslint-disable no-undef */
            if(typeof cursor  !== 'undefined'){
                query_parameters.ExclusiveStartKey = cursor;
            }

            if(typeof limit  !== 'undefined'){
                query_parameters['limit'] = limit;
            }
			/* eslint-enable */

            dynamoutilities.scanRecords(process.env.rebills_table, query_parameters, (error, data) => {

                if(_.isError(error)){
                    return reject(error);
                }

                if(_.isArray(data)){
                    return resolve(data);
                }

            });

        });

    }

    sendMessageAndMarkRebill(rebill){

        return new Promise((resolve, reject) => {

            sqsutilities.sendMessage({message_body: JSON.stringify(rebill), queue: process.env.bill_queue}, (error) =>{

                if(_.isError(error)){ return reject(error);}

                this.markRebillProcessing(rebill).then((rebill) => {

                    return resolve(rebill);

                }).catch((error) => {

                    return reject(error);

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

        return this.update(rebill);

    }

}

module.exports = new rebillController();

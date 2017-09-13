'use strict';
const _ = require('underscore');
const uuidV4 = require('uuid/v4');

//Technical Debt:  We shouldn't need the AWS utility classes here...
const dynamoutilities = global.SixCRM.routes.include('lib', 'dynamodb-utilities.js');
const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

class rebillController extends entityController {

    constructor(){
        super('rebill');
    }

	  //Note: rebills don't get product associations, only product schedules
    getProducts(rebill){

      du.debug('Get Products');

      if(_.has(rebill, 'products') && arrayutilities.nonEmpty(rebill.products)){

        return arrayutilities.map(rebill.products, (id) => {
          return this.executeAssociatedEntityFunction('productController', 'get', {id: id});
        });

      }else{

        return null;

      }

    }

    getProductSchedules(rebill) {

      du.debug('Get Product Schedules');

      if(_.has(rebill, 'product_schedules') && arrayutilities.nonEmpty(rebill.product_schedules)){

        let promises = arrayutilities.map(rebill.product_schedules, (id) => {

          return this.executeAssociatedEntityFunction('productScheduleController', 'get', {id: id});

        });

        return Promise.all(promises);

      }

      return null;

    }

    getTransactions(rebill){

      return this.executeAssociatedEntityFunction('transactionController', 'getTransactionsByRebillID', rebill.id);

    }

    getParentSession(rebill){

      if(!_.has(rebill, 'parentsession')){ return null; }

      return this.executeAssociatedEntityFunction('sessionController', 'get', {id: rebill.parentsession});

    }

    getParentSessionHydrated(rebill){

      if(!_.has(rebill, 'parentsession')){ return null; }

      return this.executeAssociatedEntityFunction('sessionController', 'getSessionHydrated', {id: rebill.parentsession});

    }


    buildRebillObject(parameters){

        let rebill_object = {
            id: this.getUUID(),
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

    //Technical Debt:  Clean this up.
	  //validate this logic with product owner
    calculateRebill(day_in_cycle, product_schedule){

        du.info(day_in_cycle, product_schedule);

        var calculated_rebill;

        product_schedule.schedule.forEach((scheduled_product) => {

            if(parseInt(day_in_cycle) >= parseInt(scheduled_product.start)){

                if(!_.has(scheduled_product, "end") || (parseInt(day_in_cycle) < parseInt(scheduled_product.end))){

                    let bill_timestamp = timestamp.createTimestampSeconds() + (scheduled_product.period * timestamp.getDayInSeconds());

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

    createRebills(session, product_schedules, day_in_cycle){

      du.debug('Create Rebills');

      if(arrayutilities.nonEmpty(product_schedules)){

        let promises = arrayutilities.map(product_schedules, (schedule) => {
          return this.createRebill(session, schedule, day_in_cycle);
        });

        return Promise.all(promises);

      }else{

        return null;

      }

    }

	//Technical Debt:  This is a mess
	//the product schedule needs to be a part of the rebill, not the product
    createRebill(session, product_schedule, day_in_cycle){

        du.debug('Create Rebill', product_schedule);

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

        return this.create({entity: rebill_object});

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

            return sqsutilities.sendMessage({message_body: JSON.stringify(rebill), queue: queue_shortname}).then(() => {

                return this.markRebillProcessing(rebill).then((rebill) => {

                    return resolve(rebill);

                });

            });

        });

    }

    getRebillsBySessionID(id){

      du.debug('Get Rebills By Session ID');

      return this.queryBySecondaryIndex({field: 'parentsession', index_value: id, index_name: 'parentsession-index'}).then((result) => {
        return this.getResult(result);
      });

    }

    listRebillsBySessionID(id, pagination){

      du.debug('List Rebills By Session ID');

      return this.listBySecondaryIndex({field: 'parentsession', index_value: id, index_name:'parentsession-index', pagination: pagination});

    }

    markRebillProcessing(rebill){

        rebill.processing = "true";

        return this.update({entity: rebill});

    }

	//Technical Debt:  This shouldn't go here...
    getRebillsAfterTimestamp(a_timestamp, cursor, limit){

        return new Promise((resolve, reject) => {

            let timestamp_iso8601 = timestamp.toISO8601(a_timestamp);

            var query_parameters = {filter_expression: 'bill_at < :timestamp_iso8601v AND processing <> :processingv', expression_attribute_values: {':timestamp_iso8601v':timestamp_iso8601, ':processingv':'true'}};

            if(!_.isUndefined(cursor)){
              query_parameters.ExclusiveStartKey = cursor;
            }

            if(!_.isUndefined(limit)){
              query_parameters['limit'] = limit;
            }

            //Technical Debt:  NO. scanByParameters?
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

          sqsutilities.sendMessage({message_body: JSON.stringify(rebill), queue: process.env.bill_queue}).then(() => {

            this.markRebillProcessing(rebill).then((rebill) => {

              return resolve(rebill);

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

        return this.update({entity: rebill});

    }

}

module.exports = new rebillController();

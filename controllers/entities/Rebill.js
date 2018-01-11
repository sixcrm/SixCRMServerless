'use strict';
const _ = require('underscore');
const uuidV4 = require('uuid/v4');

//Technical Debt:  We shouldn't need the AWS utility classes here...
const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');
const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');

class rebillController extends entityController {

    constructor(){

      super('rebill');

      this.rebillHelperController = new RebillHelperController();

    }

    //Technical Debt: finish!
    associatedEntitiesCheck({id}){
      return Promise.resolve([]);
    }

    listBySession({session, pagination}){

      du.debug('List By Session');

      return this.queryBySecondaryIndex({field: 'parentsession', index_value: this.getID(session), index_name: 'parentsession-index'});

    }

	  //Note: rebills don't get product associations, only product schedules
    getProducts(rebill){

      du.debug('Get Products');

      if(_.has(rebill, 'products') && arrayutilities.nonEmpty(rebill.products)){

        return this.executeAssociatedEntityFunction('productController', 'listBy', {list_array: rebill.products})
        .then(products => this.getResult(products, 'products'));

      }else{

        return null;

      }

    }

    listProductSchedules(rebill) {

      du.debug('List Product Schedules');

      if(_.has(rebill, 'product_schedules') && arrayutilities.nonEmpty(rebill.product_schedules)){

        let list_array = arrayutilities.filter(rebill.product_schedules, (list_item) => {
          return stringutilities.nonEmpty(list_item);
        });

        if(arrayutilities.nonEmpty(list_array)){

          let query_parameters = this.createINQueryParameters({field: 'id', list_array: list_array});

          return this.executeAssociatedEntityFunction('productScheduleController', 'listByAccount', {query_parameters: query_parameters})
          .then((product_schedules) => this.getResult(product_schedules, 'productschedules'));

        }

      }

      return null;

    }

    listTransactions(rebill){

      du.debug('List Transactions');

      return this.executeAssociatedEntityFunction('transactionController', 'listTransactionsByRebillID', {id: this.getID(rebill)});

    }

    getParentSession(rebill){

      if(!_.has(rebill, 'parentsession')){ return null; }

      return this.executeAssociatedEntityFunction('sessionController', 'get', {id: this.getID(rebill.parentsession)});

    }

    getParentSessionHydrated(rebill){

      if(!_.has(rebill, 'parentsession')){ return null; }

      return this.executeAssociatedEntityFunction('sessionController', 'getSessionHydrated', {id: rebill.parentsession});

    }


    //goes to helper
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

      du.debug('Calculate Day In Cycle');

      return timestamp.getDaysDifference(session_start);

    }

    //Technical Debt:  Clean this up.
	  //validate this logic with product owner
    //This should go in the rebill helper
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

      //Technical Debt:  This should use a entity method
      var rebill_object = this.buildRebillObject({
          parentsession: session.id,
          bill_at: rebill_parameters.bill_at,
          product_schedules: [product_schedule.id],
          amount: rebill_parameters.amount
      });

      return this.create({entity: rebill_object});

    }

    //Technical Debt:  Likely broken
    getRebillsAfterTimestamp(a_timestamp, cursor, limit){

      let timestamp_iso8601 = timestamp.toISO8601(a_timestamp);

      let query_parameters = {
        filter_expression: '#bill_at < :timestamp_iso8601v AND #processing <> :processingv',
        expression_attribute_values: {
          ':timestamp_iso8601v':timestamp_iso8601,
          ':processingv':'true'
        },
        expression_attribute_names: {
          '#bill_at':'bill_at',
          '#processing': 'processing'
        }
      };

      if(!_.isUndefined(cursor)){
        query_parameters.ExclusiveStartKey = cursor;
      }

      let pagination = {};

      if(!_.isUndefined(limit)){
        pagination.limit = limit;
      }

      return this.listByAccount({query_parameters: query_parameters, pagination: pagination})
      .then((data) => {

        //Technical Debt:  This is probably broken
        du.warning(`



          Hey! Likely Broken!



        `);

        if(_.isArray(data)){
          return data;
        }

      });

    }

    listByState({state, state_changed_after, state_changed_before, pagination}){

      du.debug(`List By State: state: '${state}', state_changed_after: '${state_changed_after}', state_changed_before: '${state_changed_before}'`);

      let query_parameters = {};

      if (state) {
        query_parameters = this.appendFilterExpression(query_parameters, '#state = :statev');
        query_parameters = this.appendExpressionAttributeNames(query_parameters, '#state', 'state');
        query_parameters = this.appendExpressionAttributeValues(query_parameters, ':statev', state);
      }

      if (state_changed_after) {
        query_parameters = this.appendFilterExpression(query_parameters, '#statechangedafter > :statechangedafterv');
        query_parameters = this.appendExpressionAttributeNames(query_parameters, '#statechangedafter', 'state_changed_at');
        query_parameters = this.appendExpressionAttributeValues(query_parameters, ':statechangedafterv', state_changed_after);
      }

      if (state_changed_before) {
        query_parameters = this.appendFilterExpression(query_parameters, '#statechangedbefore <= :statechangedbeforev');
        query_parameters = this.appendExpressionAttributeNames(query_parameters, '#statechangedbefore', 'state_changed_at');
        query_parameters = this.appendExpressionAttributeValues(query_parameters, ':statechangedbeforev', state_changed_before);
      }

      return this.listByAccount({query_parameters: query_parameters, pagination: pagination});

    }

}

module.exports = new rebillController();

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
    //Technical Debt:  Is this deprecated?
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

    getRebillsAfterTimestamp(a_timestamp){

      let timestamp_iso8601 = timestamp.castToISO8601(a_timestamp);

      let query_parameters = {
        filter_expression: '#bill_at < :timestamp_iso8601v AND #processing <> :processingv',
        expression_attribute_values: {
          ':timestamp_iso8601v': timestamp_iso8601,
          ':processingv': 'true'
        },
        expression_attribute_names: {
          '#bill_at': 'bill_at',
          '#processing': 'processing'
        }
      };

      return this.listByAccount({query_parameters: query_parameters}).then((data) => {

          return data.rebills || [];

      });

    }

    listByState({state, state_changed_after, state_changed_before, pagination}){

      du.debug('List By State');

      //du.debug(`List By State: state: '${state}', state_changed_after: '${state_changed_after}', state_changed_before: '${state_changed_before}'`);

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

'use strict';
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const eu = global.SixCRM.routes.include('lib', 'error-utilities');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities');

const mathutilities = global.SixCRM.routes.include('lib', 'math-utilities');

var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

class merchantProviderController extends entityController {

    constructor(){

      super('merchantprovider');

    }

    associatedEntitiesCheck({id}){

      du.debug('Associated Entities Check');

      let return_array = [];

      let data_acquisition_promises = [
        this.executeAssociatedEntityFunction('loadBalancerController', 'listByMerchantProviderID', {id:id}),
        //this.executeAssociatedEntityFunction('transactionController', 'listByMerchantProviderID', {id:id})
      ];

      return Promise.all(data_acquisition_promises).then(data_acquisition_promises => {

        let loadbalancers = data_acquisition_promises[0];
        //let transactions = data_acquisition_promises[1];

        if(arrayutilities.nonEmpty(loadbalancers)){
          arrayutilities.map(loadbalancers, (loadbalancer) => {
            return_array.push(this.createAssociatedEntitiesObject({name:'Load Balancer', object: loadbalancer}));
          });
        }

        /*
        if(_.has(transactions, 'transactions') && arrayutilities.nonEmpty(transactions.transactions)){
          arrayutilities.map(transactions.transactions, (transaction) => {
            return_array.push(this.createAssociatedEntitiesObject({name:'Transaction', object:transaction}));
          });
        }
        */

        return return_array;

      });

    }

    //Technical Debt:  This belongs in the vendor class
    /*
    createRefundParameters(transaction, refund){

        du.debug('Create Refund Parameters');

        let refund_parameters = {
            type: 'refund',
            amount: encodeURIComponent(numberutilities.formatFloat(refund.amount, 2))
        };

        if(_.has(transaction, 'processor_response')){

            let processor_response;

            try{
                processor_response = JSON.parse(transaction.processor_response);
            }catch(e){
                eu.throwError('server','Unable to parse processor response: '+transaction.processor_response);
            }

            if(!_.has(processor_response, 'results') || !_.has(processor_response.results, 'transactionid')){
                eu.throwError('server','Unable identify the processor "transactionid" field from the processor response: '+transaction.processor_response);
            }

            refund_parameters.transactionid = processor_response.results.transactionid;

        }

        return refund_parameters;

    }
    */

}

module.exports = new merchantProviderController();

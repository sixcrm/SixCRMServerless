'use strict';
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const eu = global.SixCRM.routes.include('lib', 'error-utilities');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities');


const mathutilities = global.SixCRM.routes.include('lib', 'math-utilities');
const NMIController = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/NMI.js');

var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

class merchantProviderController extends entityController {

    constructor(){
      //load balancer, transactions
      super('merchantprovider');
    }

    //Technical Debt: finish!
    associatedEntitiesCheck({id}){

      du.debug('Associated Entities Check');

      let return_array = [];

      let data_acquisition_promises = [
        this.executeAssociatedEntityFunction('loadBalancerController', 'listByMerchantProviderID', {id:id}),
        this.executeAssociatedEntityFunction('transactionController', 'listByMerchantProviderID', {id:id})
      ];

      return Promise.all(data_acquisition_promises).then(data_acquisition_promises => {

        let loadbalancers = data_acquisition_promises[0];
        let transactions = data_acquisition_promises[1];

        //du.warning(loadbalancers, transactions); process.exit();

        if(arrayutilities.nonEmpty(loadbalancers)){
          arrayutilities.map(loadbalancers, (loadbalancer) => {
            return_array.push(this.createAssociatedEntitiesObject({name:'Load Balancer', object: loadbalancer}));
          });
        }

        if(_.has(transactions, 'transactions') && arrayutilities.nonEmpty(transactions.transactions)){
          arrayutilities.map(transactions.transactions, (transaction) => {
            return_array.push(this.createAssociatedEntitiesObject({name:'Transaction', object:transaction}));
          });
        }

        return return_array;

      });

    }

    issueRefund(transaction, refund){

        return this.get({id: transaction.merchant_provider}).then((merchant_provider) => {

            return this.validate(merchant_provider).then(() => {

                let processor = this.createProcessorClass(merchant_provider);

                let parameters = this.createRefundParameters(transaction, refund);

                return processor.refund(parameters);

            });

        });

    }

    createRefundParameters(transaction, refund){

        du.debug('Create Refund Parameters');

        let refund_parameters = {
            type: 'refund',
            amount: encodeURIComponent(mathutilities.formatFloat(refund.amount, 2))
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

    createProcessorClass(merchant_provider){

        du.debug('Create Processor Class');

  	  if(merchant_provider.processor == 'NMI'){

        let _nmi = new NMIController({
            username: merchant_provider.username,
            password: merchant_provider.password,
            endpoint: merchant_provider.endpoint
        });

        return _nmi;

    	}else{
        eu.throwError('server','Unrecognized merchant provider: '+merchant_provider.processor);
    }

    }

}

module.exports = new merchantProviderController();

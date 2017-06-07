'use strict';
const _ = require('underscore');
const du = global.routes.include('lib', 'debug-utilities');
const mathutilities = global.routes.include('lib', 'math-utilities');
var entityController = global.routes.include('controllers', 'entities/Entity.js');
const NMIController = global.routes.include('controllers', 'vendors/merchantproviders/NMI.js');

class merchantProviderController extends entityController {

    constructor(){
        super('merchantprovider');
    }

    issueRefund(transaction, refund){

        return this.get(transaction.merchant_provider).then((merchant_provider) => {

            return this.validate(merchant_provider).then(() => {

                let processor = this.createProcessorClass(merchant_provider);

                let parameters = this.createRefundParameters(transaction, refund);

                du.warning('here'); process.exit();

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
                throw new Error('Unable to parse processor response: '+transaction.processor_response);
            }

            if(!_.has(processor_response, 'results') || !_.has(processor_response.results, 'transactionid')){
                throw new Error('Unable identify the processor "transactionid" field from the processor response: '+transaction.processor_response);
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
        throw new Error('Unrecognized merchant provider: '+merchant_provider.processor);
    }

    }

}

module.exports = new merchantProviderController();

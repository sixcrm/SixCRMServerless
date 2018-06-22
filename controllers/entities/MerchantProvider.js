

const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const arrayutilities = require('@sixcrm/sixcrmcore/util/array-utilities').default;
const entityController = require('./Entity');

module.exports = class MerchantProviderController extends entityController {

	constructor(){

		super('merchantprovider');

		this.search_fields = ['name'];

		this.encrypted_attribute_paths = [
			'gateway.username',
			'gateway.password',
			'gateway.api_key',
			'gateway.transaction_key'
		];

	}

	associatedEntitiesCheck({id}){

		du.debug('Associated Entities Check');

		let return_array = [];

		let data_acquisition_promises = [
			this.executeAssociatedEntityFunction('MerchantProviderGroupController', 'listByMerchantProviderID', {id:id}),
			//this.executeAssociatedEntityFunction('transactionController', 'listByMerchantProviderID', {id:id})
		];

		return Promise.all(data_acquisition_promises).then(data_acquisition_promises => {

			let merchantprovidergroups = data_acquisition_promises[0];
			//let transactions = data_acquisition_promises[1];

			if(arrayutilities.nonEmpty(merchantprovidergroups)){
				arrayutilities.map(merchantprovidergroups, (merchantprovidergroup) => {
					return_array.push(this.createAssociatedEntitiesObject({name:'Merchant Provider Group', object: merchantprovidergroup}));
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

	getByIds(ids) {

		return this.batchGet({ids});

	}

}

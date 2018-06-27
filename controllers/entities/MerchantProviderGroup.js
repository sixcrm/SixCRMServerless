
const _ = require('lodash');

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;

var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

module.exports = class MerchantProviderGroupController extends entityController {

	constructor(){

		super('merchantprovidergroup');

		this.search_fields = ['name'];

	}

	associatedEntitiesCheck({id}){

		du.debug('Associated Entities Check');

		let return_array = [];

		let data_acquisition_promises = [
			this.executeAssociatedEntityFunction('ProductScheduleController', 'listByMerchantProviderGroup', {merchantprovidergroup:id})
		];

		return Promise.all(data_acquisition_promises).then(data_acquisition_promises => {

			let productschedules = data_acquisition_promises[0];

			if(_.has(productschedules, 'productschedules') && arrayutilities.nonEmpty(productschedules.productschedules)){
				arrayutilities.map(productschedules.productschedules, (productschedule) => {
					return_array.push(this.createAssociatedEntitiesObject({name:'Product Schedule', object: productschedule}));
				});
			}

			return return_array;

		});

	}


	listByMerchantProviderID({id}){

		du.debug('List By Merchant Provider ID');

		return this.listByAccount({}).then(merchantprovidergroups => {

			let return_array = [];

			if(_.has(merchantprovidergroups, 'merchantprovidergroups') && arrayutilities.nonEmpty(merchantprovidergroups.merchantprovidergroups)){

				arrayutilities.map(merchantprovidergroups.merchantprovidergroups, (merchantprovidergroup) => {

					if(_.has(merchantprovidergroup, 'merchantproviders') && arrayutilities.nonEmpty(merchantprovidergroup.merchantproviders)){

						arrayutilities.find(merchantprovidergroup.merchantproviders, (merchant_provider_configuration) => {

							if(_.has(merchant_provider_configuration, 'id') && merchant_provider_configuration.id == id){

								return_array.push(merchantprovidergroup);
								return true;

							}

							return false;

						});

					}

				});

			}

			return return_array;

		});

	}

	//Note:  Used in Graph schema
	getMerchantProviderConfigurations(merchantprovidergroup){

		du.debug('Get Merchant Provider Configurations');

		return arrayutilities.map(merchantprovidergroup.merchantproviders, (merchantproviderconfiguration) => {

			return {
				"distribution": merchantproviderconfiguration.distribution,
				"merchantprovider": merchantproviderconfiguration.id
			};

		});

	}

	//Note:  Used in Graph schema
	getMerchantProviderConfiguration(merchantproviderconfiguration){

		du.debug('Get Merchant Provider Configuration');

		return this.executeAssociatedEntityFunction('MerchantProviderController', 'get', {id: merchantproviderconfiguration.merchantprovider});

	}

	getMerchantProviders(merchantprovidergroup){

		du.debug('Get Merchant Providers');

		if(arrayutilities.nonEmpty(merchantprovidergroup.merchantproviders)){

			let promises = arrayutilities.map(merchantprovidergroup.merchantproviders, (merchant_provider) => {

				//Technical Debt:  This is likely broken.
				return this.executeAssociatedEntityFunction('MerchantProviderController', 'get', {id: merchant_provider});

			});

			return Promise.all(promises);

		}else{

			return null;

		}

	}

	//Note: Necessary because of the meta-object
	getMerchantProviderGroupHydrated(id){

		du.debug('Get Merchantprovidergroup Hydrated');

		return this.get({id: id}).then((merchantprovidergroup) => {

			return this.getMerchantProviders(merchantprovidergroup).then((merchant_providers) =>{

				//Note: This marries the merchant provider to the meta object.
				for(var i = 0; i < merchantprovidergroup.merchantproviders.length; i++){

					for(var j = 0; j < merchant_providers.length; j++){

						if(merchantprovidergroup.merchantproviders[i].id == merchant_providers[j].id){

							var distribution = merchantprovidergroup.merchantproviders[i].distribution;

							merchantprovidergroup.merchantproviders[i] = {merchantprovider: merchant_providers[j], distribution: distribution};

						}

					}

				}

				return merchantprovidergroup;

			});

		});

	}

}


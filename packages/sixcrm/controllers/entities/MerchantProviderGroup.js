
const _ = require('lodash');
const arrayutilities = require('@6crm/sixcrmcore/lib/util/array-utilities').default;
const { getProductScheduleService, LegacyProductSchedule } = require('@6crm/sixcrm-product-setup');

var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

module.exports = class MerchantProviderGroupController extends entityController {

	constructor(){

		super('merchantprovidergroup');

		this.search_fields = ['name'];

	}

	async associatedEntitiesCheck({id}){
		const productSchedules = (await getProductScheduleService().find({
			merchant_provider_group_id: id
		})).map(product => LegacyProductSchedule.hybridFromProductSchedule(product));

		return productSchedules.map(productSchedule =>
			this.createAssociatedEntitiesObject({
				name: "Product Schedule",
				object: productSchedule
			})
		);
	}


	listByMerchantProviderID({id}){
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
		return arrayutilities.map(merchantprovidergroup.merchantproviders, (merchantproviderconfiguration) => {

			return {
				"distribution": merchantproviderconfiguration.distribution,
				"merchantprovider": merchantproviderconfiguration.id
			};

		});

	}

	//Note:  Used in Graph schema
	getMerchantProviderConfiguration(merchantproviderconfiguration){
		return this.executeAssociatedEntityFunction('MerchantProviderController', 'get', {id: merchantproviderconfiguration.merchantprovider});

	}

	getMerchantProviders(merchantprovidergroup){
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


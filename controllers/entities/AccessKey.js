
const _ = require('lodash');
const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const objectutilities = require('@sixcrm/sixcrmcore/util/object-utilities').default;
const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

class AccessKeyController extends entityController {

	constructor(){
		super('accesskey');
	}

	create({entity}){

		du.debug('Access Key Controller: Create');

		const accesskey_helper = global.SixCRM.routes.include('helpers', 'accesskey/AccessKey.js');

		//Note:  This caused issues with seeding...
		if(!_.has(entity, 'access_key')){
			entity.access_key = accesskey_helper.generateAccessKey();
		}

		if(!_.has(entity, 'secret_key')){
			entity.secret_key = accesskey_helper.generateSecretKey();
		}

		return super.create({entity: entity});

	}

	update({entity, ignore_updated_at}){

		du.debug('Access Key Controller: Update');

		return this.get({id: this.getID(entity)}).then(existing_access_key => {

			if(objectutilities.isObject(existing_access_key)){
				entity = objectutilities.transcribe({access_key: 'access_key', secret_key: 'secret_key'}, existing_access_key, entity, false);
			}

			return super.update({entity: entity, ignore_updated_at: ignore_updated_at});

		});

	}

	/*
    WARNING:  This method is NOT to be exposed via the Graph API.
    NOTE: This method is used in the transactional endpoint acquiretoken.  Therefore, anyone with a graph JWT could effectively scan database for all keys and secrets if provided access to this methid.
    */
	getAccessKeyByKey(access_key){

		du.debug('Get Access Key By Key');

		this.disableACLs();
		return this.getBySecondaryIndex({field: 'access_key', index_value: access_key, index_name: 'access_key-index'}).then(access_key => {
			this.enableACLs();
			return access_key;
		});

	}

}

module.exports = AccessKeyController;


const _ = require('lodash');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

//Technical Debt: Override the list method
class UserSigningStringController extends entityController {

	constructor() {
		super('usersigningstring');
	}

	create({entity}){

		du.debug('User Signing String Controller: Create');

		const userSigningStringHelperController = global.SixCRM.routes.include('helpers', 'entities/usersigningstring/UserSigningString.js');

		if(!_.has(entity, 'signing_string')){
			entity.signing_string = userSigningStringHelperController.generateSigningString();
		}

		return super.create({entity: entity});

	}

	update({entity, ignore_updated_at}){

		du.debug('User Signing String Controller: Update');

		return this.get({id: this.getID(entity)}).then(existing_user_signing_string => {

			if(objectutilities.isObject(existing_user_signing_string)){
				entity = objectutilities.transcribe({signing_string: 'signing_string'}, existing_user_signing_string, entity, false);
			}

			return super.update({entity: entity, ignore_updated_at: ignore_updated_at});

		});

	}

}

module.exports = UserSigningStringController;

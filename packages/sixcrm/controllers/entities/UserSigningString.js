
const _ = require('lodash');
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

//Technical Debt: Override the list method
class UserSigningStringController extends entityController {

	constructor() {
		super('usersigningstring');
	}

	create({entity}){
		const userSigningStringHelperController = global.SixCRM.routes.include('helpers', 'entities/usersigningstring/UserSigningString.js');

		if(!_.has(entity, 'signing_string')){
			entity.signing_string = userSigningStringHelperController.generateSigningString();
		}

		return super.create({entity: entity});

	}

	update({entity, ignore_updated_at}){
		return this.get({id: this.getID(entity)}).then(existing_user_signing_string => {

			if(objectutilities.isObject(existing_user_signing_string)){
				entity = objectutilities.transcribe({signing_string: 'signing_string'}, existing_user_signing_string, entity, false);
			}

			return super.update({entity: entity, ignore_updated_at: ignore_updated_at});

		});

	}

	async delete({id, range_key = null}) {
		const existing = await this.get({id, fatal: true});

		if ((global.user.id !== existing.user) && (global.account !== '*')) {
			throw eu.getError('server', `You are not allowed to delete the entitywith id ${id}. It belongs to ${existing.user} ${global.user.id} ${global.account}`)
		}

		return super.delete({id, range_key})
	}

}

module.exports = UserSigningStringController;


const _ = require('lodash');

const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;

const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

//Technical Debt: Override the list method
class UserDeviceTokenController extends entityController {

	constructor(){
		super('userdevicetoken');
	}

	getUserDeviceTokensByUser(user){

		du.debug('Get Device Token By User');

		return new Promise((resolve, reject) => {

			return this.queryBySecondaryIndex({field:'user', index_value: user, index_name: 'user-index'})
				.then((results) => this.getResult(results))
				.then((user_device_tokens) => {

					if(_.isArray(user_device_tokens)){

						let resolve_object = {};

						resolve_object[this.descriptive_name+'s'] = user_device_tokens;

						return resolve(resolve_object);

					}else{

						return resolve(null);

					}

				}).catch((error) => {

					return reject(error);

				});

		});

	}

}

module.exports = UserDeviceTokenController;

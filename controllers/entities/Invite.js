
const _ = require('lodash');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const random = require('@6crm/sixcrmcore/util/random').default;
//const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;

var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

module.exports = class InviteController extends entityController {

	constructor(){

		super('invite');

		//this.search_fields = ['name'];

	}

	getByHash(hash){

		du.debug('Get By Hash');

		return this.getBySecondaryIndex({field: 'hash', index_value: hash, index_name: 'hash-index'});

	}

	create({entity}){

		du.debug('Invite.create()');

		if(!_.has(entity, 'hash')){
			entity.hash = random.createRandomString(8);
		}

		return super.create({entity: entity});

	}

}

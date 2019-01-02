
const _ = require('lodash');
const random = require('@6crm/sixcrmcore/util/random').default;
//const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;

var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

module.exports = class InviteController extends entityController {

	constructor(){

		super('invite');

		//this.search_fields = ['name'];

	}

	getByHash(hash){
		return this.getBySecondaryIndex({field: 'hash', index_value: hash, index_name: 'hash-index'});

	}

	create({entity}){
		if(!_.has(entity, 'hash')){
			entity.hash = random.createRandomString(8);
		}

		return super.create({entity: entity});

	}

}

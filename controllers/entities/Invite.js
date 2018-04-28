
const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const random = global.SixCRM.routes.include('lib', 'random.js');
//const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities');

var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

module.exports = class InviteController extends entityController {

	constructor(){

		super('invite');

		//this.search_fields = ['name'];

	}

	getByHash(hash){

		du.debug('Get By Hash');

		return this.getBySecondaryIndex('hash', hash, 'hash-index');

	}

	create({entity}){

		du.debug('Invite.create()');

		if(!_.has(entity, 'hash')){
			entity.hash = random.createRandomString(8);
		}

		return super.create({entity: entity});

	}

}

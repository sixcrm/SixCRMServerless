
const _ = require('lodash');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const random = global.SixCRM.routes.include('lib', 'random.js');

var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

module.exports = class ReturnController extends entityController {

	constructor(){

		super('return');

		this.search_fields = ['alias'];

	}

	//Technical Debt: finish!
	associatedEntitiesCheck(){
		return Promise.resolve([]);
	}

	create({entity}){

		du.debug('Return.create()');

		if(!_.has(entity, 'alias')){
			entity.alias = this.createAlias();
		}

		return super.create({entity: entity});

	}

	update({entity, ignore_updated_at}){

		du.debug('Return.update()');

		if(!_.has(entity, 'alias')){
			entity.alias = this.createAlias();
		}

		return super.update({entity: entity, ignore_updated_at: ignore_updated_at});

	}

	createAlias(){

		let alias = random.createRandomString(9);

		return 'R'+alias;

	}

}

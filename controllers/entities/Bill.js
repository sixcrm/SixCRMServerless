

const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const eu = global.SixCRM.routes.include('lib', 'error-utilities');

var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

module.exports = class BillController extends entityController {

	constructor(){

		super('bill');

	}

	update(){

		du.debug('Update');

		//Technical Debt:  This doesn't work with the seeding strategy (permissionUtilties.disableACLs)
		if(this.isMasterAccount()){
			return super.update(arguments[0]);
		}

		throw eu.getError('forbidden');

	}

	create(){

		du.debug('Create');

		//Technical Debt:  This doesn't work with the seeding strategy (permissionUtilties.disableACLs)
		if(this.isMasterAccount()){
			return super.create(arguments[0]);
		}

		throw eu.getError('forbidden');

	}

	updatePaidResult({entity}){

		du.debug('Update Paid Result');

		return super.update({entity: entity});

	}

}

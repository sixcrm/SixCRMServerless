const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

module.exports = class StateController extends entityController {

	constructor(){

		super('state');

	}

}

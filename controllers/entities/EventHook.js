
const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

module.exports = class EventHookController extends entityController {

	constructor(){
		super('eventhook');
	}

}


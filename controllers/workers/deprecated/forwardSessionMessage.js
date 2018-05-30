
const forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

module.exports = class forwardSessionMessageController extends forwardMessageController {

	constructor(){

		super();

	}

};

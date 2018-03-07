'use strict';
const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

class eventHookController extends entityController {

  constructor(){
    super('eventhook');
  }

}

module.exports = new eventHookController();

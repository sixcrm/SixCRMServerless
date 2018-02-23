'use strict'

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

const SNSEventController = global.SixCRM.routes.include('controllers/workers/components/SNSEvent.js');

class RedshiftEventsController extends SNSEventController {

  constructor(){

    super();

    this.parameter_definition = {};

    this.parameter_validation = {};

    this.augmentParameters();

  }

  handleEventRecord(record){

    du.debug('Handle Event Record');

    return Promise.resolve()
    .then(() => this.parameters.set('record', record))
    .then(() => this.getMessage())
    //.then(() => this.triggerEmails())
    .then(() => this.cleanUp());

  }

}

module.exports = new RedshiftEventsController();

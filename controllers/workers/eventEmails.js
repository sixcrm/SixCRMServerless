'use strict'

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');

const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');

class EventEmailsController {

  constructor(){

    //super();

    this.parameter_definition = {};
    this.parameter_validation = {};
    this.parameters = new Parameters({validation: this.parameter_validation, definition: this.parameter_definition});

  }

  execute(event){

    return Promise.resolve()
    .then(() => this.handleEvents(event))

  }

  handleEvents(event){

    du.debug('Handle Events');

    let event_promises = arrayutilities.map(event.Records, record => {
      return this.handleEventRecord(record);
    });

    return Promise.all(event_promises).then(() => {
      return true;
    });

  }

  handleEventRecord(record){

    du.debug('Handle Event Record');

    return Promise.resolve()
    .then(() => this.validateEventRecord(record))
    .then(() => this.getMessage(record))
    .then((message) => this.triggerEmails(message));

  }

  validateEventRecord(record){

    du.debug('Validate Event Record');

    mvu.validateModel(record, global.SixCRM.routes.path('model','workers/eventEmails/snsrecord.json'));

    return true;

  }

  validateMessage(message){

    du.debug('Validate Message');

    mvu.validateModel(message, global.SixCRM.routes.path('model','workers/eventEmails/message.json'));

    return true;

  }

  getMessage(record){

    du.debug('Get Message');

    let message = record.Sns.Message;

    try{
      message = JSON.parse(message);
    }catch(error){
      du.error(error);
      eu.throwError(error);
    }

    this.validateMessage(message);

    return message;

  }

  triggerEmails(message){

    du.debug('Trigger Emails');
    du.debug(message);
    //let customer = objectutilities.findthedamnedthing...
    //get the campaign Id
      //get associated email templates
      //get associated SMTP providers
    //parse tokens into the email template
    //send the damned thing

    return true;

  }

}

module.exports = new EventEmailsController();

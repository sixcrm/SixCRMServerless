'use strict';

const du = global.SixCRM.routes.include('lib','debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');

module.exports = class SNSEventController {

    constructor(){

      this.parameter_definition = {
        execute:{
          required: {
            records: 'Records'
          },
          optional:{}
        }
      };

      this.parameter_validation = {
        'records': global.SixCRM.routes.path('model', 'workers/eventEmails/records.json'),
        'message':global.SixCRM.routes.path('model','workers/eventEmails/message.json'),
        'record':global.SixCRM.routes.path('model','workers/eventEmails/snsrecord.json')
      };

      this.parameters = new Parameters({validation: this.parameter_validation, definition: this.parameter_definition});

      this.setPermissions();

    }

    setPermissions(){

      du.debug('Set Permissions');

      this.permissionutilities = global.SixCRM.routes.include('lib','permission-utilities.js');
      this.permissionutilities.setPermissions('*',['*/*'],[])

    }

    augmentParameters(){

      du.debug('Augment Parameters');

      this.parameters.setParameterValidation({parameter_validation: this.parameter_validation});
      this.parameters.setParameterDefinition({parameter_definition: this.parameter_definition});

      return true;

    }

    execute(){

      du.debug('Execute');

      return Promise.resolve()
      .then(() => this.parameters.setParameters({argumentation: arguments[0], action:'execute'}))
      .then(() => this.handleEvents())

    }

    handleEvents(){

      du.debug('Handle Events');

      let records = this.parameters.get('records');

      let event_promises = arrayutilities.map(records, record => {
        return () => this.handleEventRecord(record);
      });

      //Technical Debt:  This would be great if it did all this stuff asyncronously down the road
      return arrayutilities.reduce(
        event_promises,
        (current, event_promise) => {
          return event_promise().then(() => {
            return true;
          })
        },
        Promise.resolve(true)
      ).then(() => {
        return true;
      });

    }

    getMessage(){

      du.debug('Get Message');

      let message = this.parameters.get('record').Sns.Message;

      try{
        message = JSON.parse(message);
      }catch(error){
        du.error(error);
        eu.throwError(error);
      }

      this.parameters.set('message', message);

      return true;

    }

    cleanUp(){

      du.debug('Clean Up');

      objectutilities.map(this.parameters.store, key => {
        if(key !== 'records'){
          this.parameters.unset(key);
        }
      });

      return true;

    }

}

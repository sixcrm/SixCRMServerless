'use strict'
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

const SNSEventController = global.SixCRM.routes.include('controllers', 'workers/components/SNSEvent.js');

class TrackingController extends SNSEventController {

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
    .then(() => this.triggerTracking())
    .then(() => this.cleanUp());

  }

  triggerTracking(){

    du.debug('Push To Redshift');

    return Promise.resolve()
    .then(() => this.isComplaintRedshiftEventType())
    //.then(() => this.assembleRedshiftObject())
    //.then(() => this.pushObjectToRedshift())
    .catch(error => {
      du.error(error);
      return true;
    });

  }

  isComplaintRedshiftEventType(){

    du.debug('Is Complaint Redshift Event Type');

    let event_type = this.parameters.get('message').event_type;

    let matching_event = arrayutilities.find(this.redshiftEventTypes, redshift_event_type => {
      let re = new RegExp(redshift_event_type);

      return stringutilities.isMatch(event_type, re);
    });

    if(_.isString(matching_event)){
      return true;
    }

    eu.throwError('server','Not a matching Redshift event type: '+event_type);

  }

}

module.exports = new TrackingController();

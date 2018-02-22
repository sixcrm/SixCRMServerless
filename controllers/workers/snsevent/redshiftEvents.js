'use strict'
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const AffiliateHelperController = global.SixCRM.routes.include('helpers','entities/affiliate/Affiliate.js');
const SNSEventController = global.SixCRM.routes.include('controllers', 'workers/components/SNSEvent.js');

class RedshiftEventsController extends SNSEventController {

  constructor(){

    super();

    this.parameter_definition = {};

    this.parameter_validation = {};

    this.augmentParameters();

    this.kinesisfirehoseutilities = global.SixCRM.routes.include('lib', 'kinesis-firehose-utilities.js');

    this.redshiftEventTypes = ['click', 'lead', 'order', 'upsell[0-9]*', 'downsell[0-9]*', 'confirm'];

    this.affiliateHelperController = new AffiliateHelperController();

  }

  handleEventRecord(record){

    du.debug('Handle Event Record');

    return Promise.resolve()
    .then(() => this.parameters.set('record', record))
    .then(() => this.getMessage())
    .then(() => this.pushToRedshift())
    .then(() => this.cleanUp());

  }

  pushToRedshift(){

    du.debug('Push To Redshift');

    return Promise.resolve()
    .then(() => this.isComplaintRedshiftEventType())
    .then(() => this.assembleRedshiftObject())
    .then(() => this.pushObjectToRedshift())
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

  assembleRedshiftObject(){

    du.debug('Assemble Redshift Object');

    let context = this.parameters.get('message').context;
    let event_type = this.parameters.get('message').event_type;

    let search_objects = ['session', 'products', 'product_schedules', 'affiliates']

    let redshift_object = {};

    arrayutilities.map(search_objects, search_object => {

      let discovered_object = objectutilities.recurseByDepth(context, (key, value) => {

        if(key == search_object){
          if(_.isObject(value)){ return true; }
          if(_.isString(value) && stringutilities.isUUID(value)){ return true; }
        }

        return false;

      });

      if(!_.isUndefined(discovered_object) && !_.isNull(discovered_object)){
        redshift_object[search_object] = discovered_object;
      }

    });

    redshift_object = this.transformRedshiftObject(redshift_object);

    this.parameters.set('redshiftobject', redshift_object);

    return true;

  }

  transformRedshiftObject(redshift_object){

    du.debug('Transform Redshift Object');

    let return_object = {
      type: this.parameters.get('message').event_type
    };

    return_object = this.transcribeSessionFields(redshift_object, return_object);

    if(_.has(redshift_object, 'product_schedules')){
      return_object.product_schedules = this.flatten(redshift_object.product_schedules, 'productschedule');
    }

    if(_.has(redshift_object, 'products')){
      return_object.products = this.flatten(redshift_object.products, 'product');
    }

    if(_.has(redshift_object, 'affiliates')){
      return_object = this.affiliateHelperController.transcribeAffiliates(redshift_object.affiliates, return_object);
    }

    return return_object;

  }

  transcribeSessionFields(source_object, destination_object){

    du.debug('Transcribe Session Fields');

    if(_.has(source_object, 'session')){

      if(_.isObject(source_object.session)){

        let session = source_object.session;

        if(_.has(session, 'id')){
          destination_object.session = session.id;
        }

        if(_.has(session, 'account')){
          destination_object.account= session.account;
        }

        if(_.has(session, 'campaign')){
          destination_object.campaign = session.campaign;
        }

        if(_.has(session, 'updated_at')){
          destination_object.datetime = session.updated_at;
        }

      }

      if(_.isString(source_object.session) && stringgutilities.isUUID(source_object.session)){
        destination_object.session = source_object.session;
      }

    }

    return destination_object;

  }

  flatten(thing, name){

    du.debug('Flatten');

    let return_object;

    if(_.isArray(thing) && arrayutilities.nonEmpty(thing)){

      return_object = arrayutilities.map(thing, thing_element => {

        if(_.isObject(thing_element)){

          if(_.has(thing_element, 'id') && stringutilities.isUUID(thing_element.id)){
            return thing_element.id;
          }

          if(_.has(thing_element, name) && stringutilities.isUUID(thing_element[name])){
            return thing[name];
          }

          if(objectutilities.hasRecursive(thing_element, name+'.id') && stringutilities.isUUID(thing_element[name].id)){
            return thing_element[name].id;
          }

        }

        if(_.isString(thing_element) && stringutilities.isUUID(thing_element)){
          return thing_element;
        }

        du.warning('Unrecognized thing:',thing_element);

      });

    }

    return_object = arrayutilities.filter(return_object, return_object_element => {
      return stringutilities.isUUID(return_object_element);
    });

    return return_object;

  }

  pushObjectToRedshift(){

    du.debug('Push Object To Redshift');

    let event_type = this.parameters.get('message').event_type;
    let redshift_object = this.parameters.get('redshiftobject');

    return this.kinesisfirehoseutilities.putRecord('events', redshift_object).then((result) => {

      du.output('Kinesis Firehose Result', result);

      return result;

    });

  }

}

module.exports = new RedshiftEventsController();

'use strict'
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const AffiliateHelperController = global.SixCRM.routes.include('helpers','entities/affiliate/Affiliate.js');
const SNSEventController = global.SixCRM.routes.include('controllers', 'workers/components/SNSEvent.js');

class RedshiftEventsController extends SNSEventController {

  constructor(){

    super();

    this.parameter_definition = {};

    this.parameter_validation = {
      'redshiftobject': global.SixCRM.routes.path('model','kinesisfirehose/events.json')
    };

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

    let search_objects = ['campaign', 'session', 'products', 'product_schedules', 'affiliates', 'datetime'];

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

    return_object = this.transcribeAccount(redshift_object, return_object);
    return_object = this.transcribeDatetime(redshift_object, return_object);
    return_object = this.transcribeCampaignFields(redshift_object, return_object);
    return_object = this.transcribeSessionFields(redshift_object, return_object);
    return_object = this.transcribeAffiliates(redshift_object, return_object);

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

  transcribeAffiliates(source_object, destination_object){

    du.debug('Transcribe Affiliates');

    if(_.has(source_object, 'affiliates')){
      destination_object = this.affiliateHelperController.transcribeAffiliates(source_object.affiliates, destination_object);
    }else if(_.has(source_object, 'session') && _.isObject(source_object.session)){
      destination_object = this.affiliateHelperController.transcribeAffiliates(source_object.session, destination_object);
    }

    return destination_object;

  }

  transcribeAccount(source_object, destination_object){

    du.debug('Transcribe Account');

    if(!_.has(destination_object, 'account') && _.has(source_object, 'account') && stringutilities.isUUID(source_object.account)){
      destination_object.account = source_object.account;
    }

    if(!_.has(destination_object, 'account') && objectutilities.hasRecursive(source_object, 'campaign.account') && stringutilities.isUUID(source_object.campaign.account)){
      destination_object.account = source_object.campaign.account;
    }

    if(!_.has(destination_object, 'account') && objectutilities.hasRecursive(source_object, 'session.account') && stringutilities.isUUID(source_object.session.account)){
      destination_object.account = source_object.campaign.account;
    }

    if(!_.has(destination_object, 'account')){
      eu.throwError('server', 'Unable to identify account.');
    }

    return destination_object;

  }

  transcribeDatetime(source_object, destination_object){

    du.debug('Transcribe Datetime');

    if(!_.has(destination_object, 'datetime') && _.has(source_object, 'datetime')){
      destination_object.datetime = source_object.datetime;
    }

    if(!_.has(destination_object, 'datetime') && objectutilities.hasRecursive(source_object, 'session.updated_at')){
      destination_object.datetime = source_object.session.updated_at;
    }

    if(!_.has(destination_object, 'datetime')){
      destination_object.datetime = timestamp.getISO8601();
    }

    return destination_object;

  }

  transcribeCampaignFields(source_object, destination_object){

    du.debug('Transcribe Campaign Fields');

    if(_.has(source_object, 'campaign')){

      if(_.isObject(source_object.campaign) && _.has(source_object.campaign, 'id') && stringutilities.isUUID(source_object.campaign.id)){
        destination_object.campaign = source_object.campaign.id
      }

      if(_.isString(source_object.campaign) && stringutilities.isUUID(source_object.campaign)){
        destination_object.campaign = source_object.campaign;
      }

    }

    if(!_.has(destination_object, 'campaign') || !stringutilities.isUUID(destination_object.campaign)){
      eu.throwError('server', 'Unable to determine campaign field.');
    }

    return destination_object;

  }

  transcribeSessionFields(source_object, destination_object){

    du.debug('Transcribe Session Fields');

    if(_.has(source_object, 'session')){

      if(_.isObject(source_object.session)){

        let session = source_object.session;

        if(_.has(session, 'id')){
          destination_object.session = session.id;
        }

      }

      if(_.isString(source_object.session) && stringutilities.isUUID(source_object.session)){
        destination_object.session = source_object.session;
      }

    }

    if(!_.has(destination_object, 'session') || !stringutilities.isUUID(destination_object.session)){
      destination_object.session = '';
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

    let redshift_object = this.parameters.get('redshiftobject');

    return this.kinesisfirehoseutilities.putRecord('events', redshift_object).then((result) => {
      return result;
    });

  }

}

module.exports = new RedshiftEventsController();

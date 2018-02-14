'use strict'
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const numberutilities = global.SixCRM.routes.include('lib', 'number-utilities.js');
const mathutilities = global.SixCRM.routes.include('lib', 'math-utilities.js');
const TransactionUtilities = global.SixCRM.routes.include('helpers', 'transaction/TransactionUtilities.js');
const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');

//Technical Debt:  Refactor
module.exports = class AffiliateHelperController {

  constructor(){

    this.affiliate_fields = ['affiliate', 'subaffiliate_1', 'subaffiliate_2', 'subaffiliate_3', 'subaffiliate_4', 'subaffiliate_5', 'cid'];

  }

  transcribeAffiliates(source_object, destination_object){

    du.debug('Transcribe Affiliates');

    destination_object = (_.isUndefined(destination_object))?{}:destination_object;

    let affiliate_mapping_object = {};

    arrayutilities.map(this.affiliate_fields, affiliate_field => {
      affiliate_mapping_object[affiliate_field] = affiliate_field;
    });

    return objectutilities.transcribe(affiliate_mapping_object, source_object, destination_object, false);

  }

  handleAffiliateInformation(event){

    du.debug('Handle Affiliate Information');

    if(_.has(event, 'affiliates')){

      let affiliate_codes = this.extractAffiliateCodes(event);

      if(arrayutilities.nonEmpty(affiliate_codes)){

        if(!_.has(this, 'affiliateController')){
          this.affiliateController = global.SixCRM.routes.include('entities', 'Affiliate.js');
        }

        return this.assureAffiliates(affiliate_codes).then(affiliates => {

          event = this.replaceAffiliateIDs(event, affiliates);

          this.validateAllAffiliatesReplaced(event);

          return event;

        });

      }

      return Promise.resolve(event);

    }else{

      return Promise.resolve(event);

    }

  }

  extractAffiliateCodes(event){

    du.debug('Extract Affiliate Codes');

    let affiliate_codes = [];

    if(_.has(event, 'affiliates')){

      arrayutilities.map(this.affiliate_fields, affiliate_field => {
        if(_.has(event.affiliates, affiliate_field)){
          affiliate_codes.push(event.affiliates[affiliate_field]);
        }
      });

    }

    return arrayutilities.unique(affiliate_codes);

  }

  replaceAffiliateIDs(event, affiliates){

    du.debug('Replace Affiliate IDs');

    arrayutilities.map(this.affiliate_fields, affiliate_field => {

      if(_.has(event.affiliates, affiliate_field)){

        let assured_affiliate = arrayutilities.find(affiliates, affiliate => {
          return (event.affiliates[affiliate_field] == affiliate.affiliate_id);
        });

        if(!_.isUndefined(assured_affiliate)){
          event.affiliates[affiliate_field] = assured_affiliate.id;
        }

      }

    });

    return event;

  }

  validateAllAffiliatesReplaced(event){

    du.debug('Validate All Affiliates Replaced');

    arrayutilities.map(this.affiliate_fields, affiliate_field => {
      if(_.has(event.affiliates, affiliate_field)){

        if(!_.has(this, 'affiliateController')){
          this.affiliateController = global.SixCRM.routes.include('entities', 'Affiliate.js');
        }

        if(!this.affiliateController.isUUID(event.affiliates[affiliate_field])){
          eu.throwError('server', 'Unable to assure '+affiliate_field+': "'+event.affiliates[affiliate_field]+'".');
        }
      }
    });

  }

  validateAssureAffiliatesArray(affiliate_ids){

    du.debug('Validate Assure Affiliates Array');

    arrayutilities.nonEmpty(affiliate_ids, true);

    let all_strings = arrayutilities.every(affiliate_ids, (affiliate_id) => {
      return stringutilities.nonEmpty(affiliate_id);
    });

    if(all_strings == false){
      eu.throwError('server', 'affiliateHelperController.assureAffiliates assumes all affiliate ID\'s are strings.');
    }

  }

  assureAffiliates(affiliate_ids){

    du.debug('Assure Affiliates');

    this.validateAssureAffiliatesArray(affiliate_ids);

    affiliate_ids = arrayutilities.unique(affiliate_ids);

    if(!_.has(this, 'affiliateController')){
      this.affiliateController = global.SixCRM.routes.include('entities', 'Affiliate.js');
    }

    //Technical Debt:  We don't like this query...
    return this.affiliateController.listBy({list_array: affiliate_ids, field: 'affiliate_id'})
    .then(affiliates => this.affiliateController.getResult(affiliates, 'affiliates'))
    .then(affiliates => this.assureAffiliatesArrayTransform({affiliate_ids: affiliate_ids, affiliates: affiliates}))
    .then(assured_affiliates => this.validateAssuredAffiliates({affiliate_ids: affiliate_ids, assured_affiliates: assured_affiliates}));

  }

  validateAssuredAffiliates({affiliate_ids, assured_affiliates}){

    du.debug('Validate Assured Affiliates');

    //Sanity Check
    arrayutilities.nonEmpty(assured_affiliates, true);
    arrayutilities.nonEmpty(affiliate_ids, true);

    if(assured_affiliates.length != affiliate_ids.length){
      eu.throwError('server', 'Assured affiliates result has different length than input ID array.');
    }

    return assured_affiliates;

  }

  assureAffiliatesArrayTransform({affiliate_ids, affiliates}){

    du.debug('Assure Affiliates Array Transform');

    let return_array = [];

    arrayutilities.map(affiliate_ids, (affiliate_id) => {

      let affiliate_match = this.hasAffiliateMatch({affiliate_id: affiliate_id, affiliates: affiliates});

      if(affiliate_match === false){

        if(!_.has(this, 'affiliateController')){
          this.affiliateController = global.SixCRM.routes.include('entities', 'Affiliate.js');
        }

        return_array.push(this.affiliateController.create({entity:{affiliate_id: affiliate_id}}));

        return;

      }

      return_array.push(affiliate_match);

    });

    return Promise.all(return_array);

  }

  hasAffiliateMatch({affiliate_id, affiliates}){

    du.debug('Has Affiliate Match');

    if(arrayutilities.nonEmpty(affiliates)){

      let affiliate_record = arrayutilities.find(affiliates, affiliate => {
        return (_.has(affiliate, 'affiliate_id') && affiliate.affiliate_id == affiliate_id);
      });

      if(!_.isUndefined(affiliate_record)){
        return affiliate_record;
      }

    }

    return false;

  }


}

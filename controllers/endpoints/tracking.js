'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const modelvalidationutilities = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');

const transactionEndpointController = global.SixCRM.routes.include('controllers', 'endpoints/transaction.js');
const trackerController = global.SixCRM.routes.include('controllers', 'entities/Tracker.js');
const affiliateController = global.SixCRM.routes.include('controllers', 'entities/Affiliate.js');

class trackingController extends transactionEndpointController{

    constructor(){
        super({
            required_permissions: [
              'tracker/read'
            ]
        });

    }

    execute(event){

      du.debug('Execute');

      return this.preprocessing((event))
			.then((event) => this.acquireBody(event))
			.then((event) => this.validateInput(event, this.validateEventSchema))
      .then((event) => this.acquireAffiliate(event))
			.then((affiliate) => this.acquireTrackers(affiliate, event));

    }

    validateEventSchema(event){

      du.debug('Validate Event Schema');

      return modelvalidationutilities.validateModel(event,  global.SixCRM.routes.path('model', 'endpoints/tracking.json'));

    }

    acquireAffiliate(event){

      du.debug('Acquire Affiliate');

      return affiliateController.getByAffiliateID(event.affiliate_id).then(affiliate => {

        if(_.has(affiliate, 'id')){
          this.affiliate = affiliate;
        }else{
          this.affiliate = null;
        }

        return event;

      });

    }

    acquireTrackers(event){

      du.debug('Acquire Trackers');

      return trackerController.listByCampaignAndAffiliate({campaign: event.campaign, affiliate: this.affiliate, type:'html'});

    }

}

module.exports = new trackingController();

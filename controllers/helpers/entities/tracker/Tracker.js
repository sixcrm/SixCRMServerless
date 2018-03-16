'use strict'
const _ =  require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

module.exports = class TrackerHelperController{

    constructor(){}

    handleTracking(session, data){

      du.debug('Handle Postbacks')

      return this.getAffiliateIDsFromSession(session).then((affiliate_ids) => {

        return this.executeAffiliatesTracking(affiliate_ids, data);

      });

    }

    getAffiliateIDsFromSession(session){

      du.debug('Get Affiliate IDs From Session');

      if(!_.has(this, 'sessionController')){
        this.sessionController = global.SixCRM.routes.include('controllers', 'entities/Session.js');
      }

      return this.sessionController.getAffiliateIDs(session);

    }

    //Note:  This structure allows for additional tracking behaviors.
    executeAffiliatesTracking(affiliate_ids, data){

        du.debug('Execute Affiliates Tracking');

        if(!_.isArray(affiliate_ids) || affiliate_ids.length < 1){

            du.debug('No affiliate identifier information.');

            return Promise.resolve(null);

        }

        let affiliate_tracker_executions = [];

        affiliate_ids.forEach((affiliate_id) => {

            affiliate_tracker_executions.push(this.executeAffiliateTrackers(affiliate_id, data));

        });

        return Promise.all(affiliate_tracker_executions).then((affiliate_tracker_executions) => {

            return affiliate_tracker_executions;

        });

    }

    executeAffiliateTrackers(affiliate_id, data){

        du.debug('Execute Affiliate Trackers');

        if(!_.has(this, 'trackerController')){
          this.trackerController = global.SixCRM.routes.include('controllers', 'entities/Tracker.js');
        }

        return this.trackerController.listByAffiliate({affiliate: affiliate_id}).then((trackers) => {

            if(!_.isArray(trackers)){

                du.debug('No trackers associated with this affiliate.');

                return Promise.resolve(null);

            }

            let tracker_executions = [];

            trackers.forEach((tracker) => {

                tracker_executions.push(this.executeTracker(tracker, data));

            });

            return Promise.all(tracker_executions);

        });

    }

    executeTracker(tracker, data){

        du.debug('Execute Tracker');

        return new Promise((resolve, reject) => {

            switch(tracker.type){

            case 'postback':

              if(!_.has(this, 'trackerController')){
                this.trackerController = global.SixCRM.routes.include('controllers', 'entities/Tracker.js');
              }

              return this.trackerController.executePostback(tracker, data).then((result) => {

                return resolve(result);

              });

            case 'html':

              du.debug('Tracker has HTML type, skipping.');

              return resolve(null);

            default:

              return reject(eu.getError('validation','Unrecognized Tracker type: '+tracker.type));

            }

        });

    }

}

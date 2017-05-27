'use strict'
const _ =  require('underscore');

const du = global.routes.include('lib', 'debug-utilities.js');

const sessionController = global.routes.include('controllers', 'entities/Session.js');
const trackerController = global.routes.include('controllers', 'entities/Tracker.js');

class TrackerUtilities {

    constructor(){

    }

    handleTracking(session, data){

        du.debug('Handle Postbacks')

        return this.getAffiliateIDsFromSession(session).then((affiliate_ids) => {

            return this.executeAffiliatesTracking(affiliate_ids, data);

        });

    }

    getAffiliateIDsFromSession(session){

        du.debug('Get Affiliate IDs From Session');

        return sessionController.getAffiliateIDs(session);

    }

    //Note:  This structure allows for additional tracking behaviors.
    executeAffiliatesTracking(affiliate_ids, data){

        du.debug('Execute Affiliates Tracking');

        return new Promise((resolve, reject) => {

            if(!_.isArray(affiliate_ids) || affiliate_ids.length < 1){

                du.info('No affiliate identifier information.');

                return resolve(null);

            };

            let affiliate_tracker_executions = [];

            affiliate_ids.forEach((affiliate_id) => {

                affiliate_tracker_executions.push(this.executeAffiliateTrackers(affiliate_id, data));

            });

            return Promise.all(affiliate_tracker_executions).then((affiliate_tracker_executions) => {

                return resolve(affiliate_tracker_executions);

            });

        });

    }

    executeAffiliateTrackers(affiliate_id, data){

        du.debug('Execute Affiliate Trackers');

        return trackerController.getByAffiliateID(affiliate_id).then((trackers) => {

            if(!_.isArray(trackers)){

                du.warning('Trackers is not an array...');

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

                trackerController.executePostback(tracker, data).then((result) => {

                    return resolve(result);

                });

                break;

            case 'html':

                du.debug('Tracker has HTML type, skipping.');

                return resolve(null);

            default:

                return reject(new Error('Unrecognized Tracker type: '+tracker.type));

            }

        });

    }

}

var tu = new TrackerUtilities();

module.exports = tu;

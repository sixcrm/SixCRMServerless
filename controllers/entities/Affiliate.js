'use strict';
const _ = require('underscore');

const du = global.routes.include('lib', 'debug-utilities');

var entityController = global.routes.include('controllers', 'entities/Entity.js');


class affiliateController extends entityController {

    constructor(){

        super('affiliate');

        this.trackerController = global.routes.include('controllers', 'entities/Tracker.js');
        this.sessionController = global.routes.include('controllers', 'entities/Session.js');

    }

    assureAffiliate(value){

        du.debug('Assure Affiliate');

        return this.get(value).then((result) => {

            if(!_.isNull(result)){
                return result;
            }

            return this.getBySecondaryIndex('affiliate_id', value, 'affiliate_id-index').then((result) => {

                if(!_.isNull(result)){
                    return result;
                }

                return this.create({affiliate_id:value}).then((result) => {

                    if(!_.isNull(result)){
                        return result;
                    }

                    throw new Error('Unable to assure affiliate.');

                });

            });

        });

    }

    //Technical Debt:  Incomplete
    getCampaigns(affiliate, pagination){

        du.debug('Get Campaigns');

        let affiliate_id = this.getID(affiliate);

        return this.sessionController.listSessionsByAffiliate(affiliate, pagination);

    }

    getTrackers(affiliate){

        du.debug('Get Trackers');

        let affiliate_id = this.getID(affiliate);

        return this.trackerController.listBySecondaryIndex('affiliate', affiliate_id, 'affiliate-index');

    }

}

module.exports = new affiliateController();

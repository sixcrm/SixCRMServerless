'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const eu = global.SixCRM.routes.include('lib', 'error-utilities');

var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

class affiliateController extends entityController {

    constructor(){

        super('affiliate');

    }

    assureAffiliate(value){

        du.debug('Assure Affiliate');

        return this.get(value).then((result) => {

            if(!_.isNull(result)){
                return result;
            }

            return this.getBySecondaryIndex({field: 'affiliate_id', index_value: value, index_name: 'affiliate_id-index'}).then((result) => {

                if(!_.isNull(result)){
                    return result;
                }

                return this.create({affiliate_id: value}).then((result) => {

                    if(!_.isNull(result)){
                        return result;
                    }

                    eu.throwError('server','Unable to assure affiliate.');

                });

            });

        });

    }

    //Technical Debt:  Incomplete
    getCampaigns(affiliate, pagination){

      du.debug('Get Campaigns');

      let affiliate_id = this.getID(affiliate);

      return this.executeAssociatedEntityFunction('sessionController', 'listSessionsByAffiliate', {id: affiliate, pagination: pagination});

    }

    getTrackers(affiliate){

      du.debug('Get Trackers');

      let affiliate_id = this.getID(affiliate);

      return this.executeAssociatedEntityFunction('trackerController', 'listBySecondaryIndex', {field:'affiliate', index_value: affiliate_id, index_name: 'affiliate-index'});

    }

}

module.exports = new affiliateController();

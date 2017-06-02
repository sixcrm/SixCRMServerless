'use strict';
const _ = require('underscore');

var trackerController = global.routes.include('controllers', 'entities/Tracker.js');
var entityController = global.routes.include('controllers', 'entities/Entity.js');


class affiliateController extends entityController {

    constructor(){
        super('affiliate');
    }

    assureAffiliate(value){

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

    getTrackers(affiliate){

        let affiliate_id = this.getID(affiliate);

        return trackerController.listBySecondaryIndex('affiliate', affiliate_id, 'affiliate-index');

    }

}

module.exports = new affiliateController();

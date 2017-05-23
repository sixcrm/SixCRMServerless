'use strict';
const _ = require('underscore');

var entityController = global.routes.include('controllers', 'entities/Entity.js');

class affiliateController extends entityController {

    constructor(){
        super(process.env.affiliates_table, 'affiliate');
        this.table_name = process.env.affiliates_table;
        this.descriptive_name = 'affiliate';
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

}

module.exports = new affiliateController();

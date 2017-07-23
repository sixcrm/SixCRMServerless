'use strict';
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities');
const EntityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

module.exports = class ActivityToEnglishUtilities {

    constructor(activity_row){

        du.debug('Constructor');

        this.setActivityRow(activity_row);

        this.statement_templates = {
            actor_only: '{actor} {action}.', //Jesus wept.
            actor_and_acted_upon: '{actor} {action} {acted_upon}.', //User randy.bandy@sixcrm.com created a new product: Happy Joyful Product.
            actor_and_acted_upon_and_associated_with: '{actor} {action} {acted_upon} associated with {associated_with}.' //User randy.bandy@sixcrm.com updated a Merchant Provider associated with Campaign Happy Joyful Campaign.
        };

    }

    //Entrypoint
    appendActivityEnglishObject(){

        du.debug('Append Activity Statement');

        return this.buildActivityEnglishObject().then((english_string) => {

            this.activity_row['english'] = english_string;

            return this.activity_row;

        });

    }

    //Entrypoint
    buildActivityEnglishObject(){

        du.debug('Build Activity Statement');

        return this.validateActivityRow()
        .then(() => this.acquireResources())
        .then(() => this.setEnglishTemplate())
        .then(() => this.buildObject());

    }

    validateActivityRow(){

        du.debug('Validate Activity Row');

        try{

            mvu.validateModel(this.activity_row, global.SixCRM.routes.path('model', 'redshift/activity.json'));

        }catch(e){

            du.warning(this.activity_row, e);

            return Promise.reject(e);

        }

        du.info('Model Validated');

        return Promise.resolve(true);

    }

    acquireResources(){

        du.debug('Acquire Resources');

        let promises = [];

        promises.push(this.getActor());
        promises.push(this.getActedUpon());
        promises.push(this.getAssociatedWith());

        return Promise.all(promises).then(() => {

            return true;

        });

    }

    setEnglishTemplate(){

        du.debug('Set English Template');

        if(_.has(this, 'associated_with') && _.has(this,'acted_upon')){
            this.english_template = this.statement_templates.actor_and_acted_upon_and_associated_with;
        }else if(_.has(this,'acted_upon')){
            this.english_template = this.statement_templates.actor_and_acted_upon;
        }else{
            this.english_template = this.statement_templates.actor_only;
        }

        return Promise.resolve(true);

    }

    buildObject(){

        du.debug('Build Object');

        let english_object = {
            actor: this.actor,
            acted_upon: this.acted_upon,
            associated_with: this.associated_with,
            english_template: this.english_template
        };

        english_object = JSON.stringify(english_object);

        return Promise.resolve(english_object);

    }

    parseActivityRow(){

        du.debug('Parse Activity Row');

        let parsed_activity_row = '';

        return Promise.resolve(parsed_activity_row);

    }

    getActor(){

        du.debug('Get Actor');

        return this.get('actor');

    }

    getAssociatedWith(){

        du.debug('Get Associated With');

        return this.get('associated_with');

    }

    getActedUpon(){

        du.debug('Get Acted Upon');

        return this.get('acted_upon');

    }

    get(type){

        du.debug('Get');

        if(!_.has(this.activity_row, type) || this.activity_row[type] == ''){

            return Promise.resolve(null);

        }

        if(this.activity_row[type] == 'system' || this.activity_row[type+'_type'] == 'system'){

            return Promise.resolve(this.getSystemObject());

        }

        let parameters = {id: this.activity_row[type], type: this.activity_row[type+'_type']};

        return this.getEntity(parameters).then((entity) => {

            du.info(parameters);

            if(_.has(entity, 'id')){

                this[type] = entity;

                return true;

            }

            du.warning('Unable to identify '+type+'.');

            this[type] = parameters;

            return true;

        }).catch((error) => {

            throw error;

        });


    }

    getSystemObject(){

        return {
            id: 'system',
            name: 'SixCRM',
        };

    }

    getEntity(parameters){

        du.debug('Get Entity');

        let ec = new EntityController(parameters.type);

        return ec.get(parameters.id);

    }

    setActivityRow(activity_row){

        du.debug('Set Activity Row');

        this.activity_row = activity_row;

    }

}


const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');

module.exports = class ContextHelperController {

	constructor(){

		const AffiliateHelperController = global.SixCRM.routes.include('helpers','entities/affiliate/Affiliate.js');
		this.affiliateHelperController = new AffiliateHelperController();

	}

	discoverObjectsFromContext(search_objects, context, fatal){

		du.debug('Discover Objects From Context');

		fatal = (_.isUndefined(fatal) || _.isNull(fatal))?false:fatal;

		let return_object = {};

		arrayutilities.map(search_objects, search_object => {

			let discovered_object = objectutilities.recurseByDepth(context, (key, value) => {

				if(key == search_object){
					if(_.isObject(value)){ return true; }
					if(_.isString(value) && stringutilities.isUUID(value)){ return true; }
				}

				return false;

			});

			if(!_.isUndefined(discovered_object) && !_.isNull(discovered_object)){
				return_object[search_object] = discovered_object;
			}

		});

		if(fatal){
			arrayutilities.map(search_objects, search_object => {
				if(!_.has(return_object, search_object)){
					throw eu.getError('server','Unable to discover '+search_object+' in context.');
				}
			});
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
			destination_object.account = source_object.session.account;
		}

		if(!_.has(destination_object, 'account')){
			throw eu.getError('server', 'Unable to identify account.');
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
			throw eu.getError('server', 'Unable to determine campaign field.');
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

	//Note: Takes an array of things and gets the IDs
	discoverIDs(thing, name){

		du.debug('Discover IDs');

		let return_object;

		if(_.isArray(thing) && arrayutilities.nonEmpty(thing)){

			return_object = arrayutilities.map(thing, thing_element => {

				if(_.isObject(thing_element)){

					if(_.has(thing_element, 'id') && stringutilities.isUUID(thing_element.id)){
						return thing_element.id;
					}

					if(_.has(thing_element, name) && stringutilities.isUUID(thing_element[name])){
						return thing_element[name];
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

	getFromContext(context, field, type){

		du.debug('Get From Context');

		type = (_.isUndefined(type) || _.isNull(type))?'id':type;

		let field_path = field.split('.');

		let discovered = objectutilities.recurseByDepth(context, (key, value) => {

			if(key == field_path[0]){

				if(type == false && field_path.length == 1){
					return true;
				}

				if(field_path.length > 1){
					if(objectutilities.hasRecursive(value, field_path.slice(1)) == false){
						return false;
					}
				}

				if(type == false){
					return true;
				}

				let identified_value = null

				if(_.isObject(value)){
					identified_value = objectutilities.getRecursive(value, field_path.slice(field_path.length - 1));
				}else{
					identified_value = value;
				}

				if(type == 'email'){
					if(_.isString(identified_value) && stringutilities.isEmail(identified_value)){
						return true;
					}
				}

				if(type == 'id'){
					if(_.isString(identified_value)){
						if(global.SixCRM.validate(identified_value, global.SixCRM.routes.path('model','definitions/sixcrmidentifier.json'), false)){
							return true;
						}
					}
				}

				if(type == 'object'){
					if(_.isObject(identified_value)){
						return true;
					}
				}

			}

			return false;

		});

		if(discovered){

			if(field_path.length > 1){
				field_path.shift();
				discovered = objectutilities.getRecursive(discovered, field_path);
			}

			return discovered;

		}

		du.warning('Unable to determine '+field+' from context.');

		return null;

	}

};

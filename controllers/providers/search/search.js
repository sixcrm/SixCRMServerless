
const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const CloudsearchProvider = global.SixCRM.routes.include('controllers', 'providers/cloudsearch-provider.js');
const cloudsearchprovider = new CloudsearchProvider();
const permissionutilities = global.SixCRM.routes.include('lib', 'permission-utilities.js');

module.exports = class SearchController {

	constructor(){

	//Technical Debt:  This needs to be configured.
		this.entity_types = {
			product: 'product',
			affiliate: 'affiliate',
			campaign: 'campaign',
			creditcard: 'creditcard',
			customer: 'customer',
			productschedule: 'productschedule',
			merchantprovider: 'merchantprovider',
			shippingreceipt: 'shippingreceipt',
			transaction: 'transaction',
			session: 'session'
		};

	}

	search(search_input){

		return this.retrieveResults(search_input).then((results) => this.flattenResults(results));

	}

	appendFilters(search_input){

		let promises = [];

		promises.push(this.createAccountFilter());
		promises.push(this.createActionFilter());

		return Promise.all(promises).then((promises) => {

			let account_filter = promises[0];
			let action_filter = promises[1];
			let complete_filter = '';

			du.debug('account_filter', account_filter);
			du.debug('action_filter', action_filter);

			if(_.has(search_input, 'filterQuery')){
				complete_filter = this.assembleFilter([account_filter, action_filter, search_input['filterQuery']]);
			}else{
				complete_filter = this.assembleFilter([account_filter, action_filter]);
			}

			search_input['filterQuery'] = complete_filter;

			return search_input;

		});

	}

	//Technical Debt:  What happens when all arguments are empty strings?
	assembleFilter(string_arguments){

		if(string_arguments.length > 0){

			let filter_arguments = '(and '+string_arguments.join('')+')';

			return filter_arguments;

		}

	}

	createActionFilter(){

		du.debug('Append Action Filter');

		let promises = [];

		for(var key in this.entity_types){

			promises.push(permissionutilities.validatePermissions('read', key));

		}

		return Promise.all(promises).then((promises) => {

			let entity_type_keys = Object.keys(this.entity_types);

			let action_filters = [];

			for(var i in promises){
				if(promises[i]){
					action_filters.push('(term field=entity_type \''+this.entity_types[entity_type_keys[i]]+'\')');
				}
			}

			du.debug(action_filters);

			if(action_filters.length > 0){

				let action_filter = '(or '+action_filters.join('')+')';

				return action_filter;

			}else{

				return '';

			}

		});

	}

	createAccountFilter(){

		du.debug('Create Account Filter.');

		let account_filter = false;

		if(_.has(global, 'account') && global.account !== '*'){

			account_filter = '(term field=account \''+global.account+'\')';

		}

		du.debug('Account Filter:', account_filter);

		if(account_filter == false){

			return Promise.resolve('');

		}else{

			return Promise.resolve(account_filter);

		}

	}

	retrieveResults(search_input){

		return new Promise((resolve, reject) => {

			return this.appendFilters(search_input).then((search_input) => {

				return cloudsearchprovider.search(search_input).then((results) => {

					du.info(results);

					results = this.serializeFacets(results);

					//results = this.flattenResults(results);

					du.info('Flattened Results', results);

					return resolve(results);

				}).catch((error) => {

					du.warning('Search Error: '+error);

					return reject(error);

				});

			});

		});

	}

	serializeFacets(results){

		if(_.has(results, 'facets')){

			results['facets'] = JSON.stringify(results.facets);

		}

		return results;

	}

	flattenResults(results){

		du.debug('Flattening Search Results');

		if(_.has(results, 'hits') && _.has(results.hits, 'hit') && _.isArray(results.hits.hit)){

			let flattened_hits = [];

			results.hits.hit.forEach((result) => {

				var flattened_hit = {id:null, fields:{}};

				for(var k in result){

					if(k != 'fields'){

						flattened_hit[k] = result[k];

					}else{

						//Technical Debt:  Note that AWS returns some strange data types here...
						flattened_hit[k] = JSON.stringify(result[k]);

					}

				}

				flattened_hits.push(flattened_hit);

			});

			results.hits['hit'] = flattened_hits;

		}

		du.debug('Flattened Results', results);

		return Promise.resolve(results);

	}

}

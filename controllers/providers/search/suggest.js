
const _ = require('lodash');
const CloudsearchProvider = global.SixCRM.routes.include('controllers', 'providers/cloudsearch-provider.js');
const cloudsearchprovider = new CloudsearchProvider();

module.exports = class SuggestController {

	constructor(){

	}

	suggest(suggestion_parameters){

		return this.retrieveSuggestions(suggestion_parameters).then((results) => this.flattenResults(results));

	}

	retrieveSuggestions(suggestion_parameters){

		return new Promise((resolve, reject) => {

			cloudsearchprovider.suggest(suggestion_parameters).then((results) => {

				return resolve(results);

			}).catch((error) => {

				return reject(error);

			});

		});

	}

	flattenResults(results){
		if(_.has(results, 'suggest') && _.has(results.suggest, 'suggestions') && _.isArray(results.suggest.suggestions)){

			let flattened_suggestions = [];

			results.suggest.suggestions.forEach((result) => {

				var flattened_suggestion = {};

				for(var k in result){

					if(k != 'suggestion'){

						flattened_suggestion[k] = result[k];

					}else{

						flattened_suggestion[k] = result[k].replace(/(^")|("$)/g, '');

					}

				}

				flattened_suggestions.push(flattened_suggestion);

			});

			results.suggest['suggestions'] = flattened_suggestions;

		}

		return Promise.resolve(results);

	}

}


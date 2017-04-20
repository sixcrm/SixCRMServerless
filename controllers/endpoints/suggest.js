'use strict';
const _ = require("underscore");
const du = require('../../lib/debug-utilities.js');
const cloudsearchutilities = require('../../lib/cloudsearch-utilities.js');

var endpointController = require('./endpoint.js');

class suggestController extends endpointController {

    constructor(){
        super();
    }

    suggest(suggestion_parameters){

        return this.retrieveSuggestions(suggestion_parameters).then((results) => this.flattenResults(results));

    }

    retrieveSuggestions(suggestion_parameters){

        return new Promise((resolve, reject) => {

            du.debug('Suggestion Parameters:', suggestion_parameters);

            cloudsearchutilities.suggest(suggestion_parameters).then((results) => {

                du.debug('Raw Results:', results);

                return resolve(results);

            }).catch((error) => {

                return reject(error);

            });

        });

    }

    flattenResults(results){

        du.debug('Flattening Suggestion Results');

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

        du.debug('Flattened Results', results);

        return Promise.resolve(results);

    }

}

module.exports = new suggestController();
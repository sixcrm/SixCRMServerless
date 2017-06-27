"use strict"
require('../../routes.js');
const _ = require('underscore');
const du = global.routes.include('lib', 'debug-utilities.js');
const eu = global.routes.include('lib', 'debug-utilities.js');

const cloudsearchutilities = global.routes.include('lib', 'cloudsearch-utilities.js');

du.highlight('Executing CloudSearch Index Purge');

let query_parameters = {
    queryParser: 'structured',
    query: 'matchall',
    size: '10000'
};

cloudsearchutilities.search(query_parameters).then((results) => {

    let purge_doc = [];

    if(_.has(results, 'hits')){

        if(_.has(results.hits, 'found')){

            du.highlight('Removing '+results.hits.found+' documents');

        }else{

            eu.throwError('server','Unable to identify found count in search results.');

        }

        if(_.has(results.hits, 'hit') && _.isArray(results.hits.hit)){

            results.hits.hit.forEach((hit) => {

                purge_doc.push('{"type": "delete", "id": "'+hit.id+'"}');

            });

        }else{

            eu.throwError('server','Unable to identify hit property in search results hits.');

        }

    }else{

        eu.throwError('server','Unable to identify hits property in search results.');

    }

    if(purge_doc.length > 0){

        return '['+purge_doc.join(',')+']';

    }else{

        return false;

    }

}).then((purge_doc) => {

    if(purge_doc == false){

        du.highlight('No documents to purge.');

    }else{

        cloudsearchutilities.uploadDocuments(purge_doc).then((response) => {

            du.highlight('Purge Response: ', response);

        });

    }

}).catch((error) => {

    eu.throwError('server', error);

});

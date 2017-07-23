'use strict';
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

module.exports = class CloudsearchDeployment{

    constructor() {

      this.cloudsearchutilities = global.SixCRM.routes.include('lib', 'cloudsearch-utilities.js');

      this.setDomainName();

    }

    setDomainName(){

      let site_config = global.SixCRM.configuration.site_config;

      if(_.has(site_config, 'cloudsearch') && _.has(site_config.cloudsearch, 'domainname')){

        this.domainname = site_config.cloudsearch.domainname;

      }else{

        eu.throwError('server', 'Unable to identify configured domainname.');

      }

    }

    deploy(){

      return this.createCloudsearchDomain()
      .then(() => this.createCloudsearchIndexes())
      .then(() => this.indexCloudsearchDocuments())
      .then(() => { return 'Complete'; });

    }

    destroy(){

      return this.deleteCloudsearchDomain()
      .then(() => { return 'Complete'; });

    }

    purge(){

      return this.getCloudsearchPurgeDocument()
      .then((purge_document) => this.purgeCloudsearchDocuments(purge_document))
      .then(() => { return 'Complete'; });

    }

    getCloudsearchPurgeDocument(){

      let query_parameters = {
          queryParser: 'structured',
          query: 'matchall',
          size: '10000'
      };

      return this.cloudsearchutilities.search(query_parameters).then((results) => {

        let documents = [];

        if(_.has(results, 'hits')){

          if(_.has(results.hits, 'found')){

            du.highlight('Removing '+results.hits.found+' documents');

          }else{

            eu.throwError('server','Unable to identify found count in search results.');

          }

          if(_.has(results.hits, 'hit') && _.isArray(results.hits.hit)){

            results.hits.hit.forEach((hit) => {

              documents.push('{"type": "delete", "id": "'+hit.id+'"}');

            });

          }else{

            eu.throwError('server','Unable to identify hit property in search results hits.');

          }

        }else{

          eu.throwError('server','Unable to identify hits property in search results.');

        }

        if(documents.length > 0){

          return '['+arrayutilities.compress(documents,',')+']';

        }else{

          return false;

        }

      });

    }

    purgeCloudsearchDocuments(purge_document){

      du.debug('Purge Cloudsearch Documents');

      if(purge_document == false){

        du.highlight('No documents to purge.');

        return Promise.resolve(null);

      }else{

        return this.cloudsearchutilities.uploadDocuments(purge_document).then((response) => {

          du.highlight('Purge Response: ', response);

          return response;

        });

      }

    }

    createCloudsearchDomain() {

      du.debug('Create Cloudsearch Domain');

      return this.cloudsearchutilities.createDomain(this.domainname).then(() => this.cloudsearchutilities.waitFor(this.domainname, 'ready'));

    }

    createCloudsearchIndexes() {

      du.debug('Create Cloudsearch Indexes');

      let index_objects = this.getIndexConfigurations();

      let index_promises = index_objects.map((index_object) => { return () => this.createCloudsearchIndex(index_object); });

      return arrayutilities.reduce(
        index_promises,
        (current, next) => {
          if(_.isUndefined(current)){
            return next;
          }
          return current.then(next);
        },
        Promise.resolve()
      );

      /*
      return index_promises.reduce(function(current, next) {
          if(_.isUndefined(current)){
            return next;
          }
          return current.then(next);
      }, Promise.resolve());
      */

    }

    getIndexComfigurations(){

      du.debug('Get Index Objects');

      let files = fileutilities.getDirectoryFilesSync(global.SixCRM.routes.path('deployment','cloudsearch/indexes'));

      let index_objects = arrayutilities.map(files, (file) => {

        let index_object = global.SixCRM.routes.include('deployment','cloudsearch/indexes/'+file);

        index_object.DomainName = this.domainname;

        return index_object;

      });

      return index_objects;

    }

    createCloudsearchIndex(index_object) {

      du.debug('Create Cloudsearch Index');

      return this.cloudsearchutilities.defineIndexField(index_object);

    }

    indexCloudsearchDocuments() {

      du.debug('Index Cloudsearch Documents');

      return this.cloudsearchutilities.indexDocuments(this.domainname);

    }

    deleteCloudsearchDomain(){

      du.debug('Delete Domain');

      return this.cloudsearchutilities.deleteDomain(this.domainname);

    }

}

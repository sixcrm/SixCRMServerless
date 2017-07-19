'use strict'
const AWS = require("aws-sdk");
const _ = require('underscore');
const du = global.routes.include('lib', 'debug-utilities.js');
const eu = global.routes.include('lib', 'error-utilities.js');
const configurationutilities = global.routes.include('lib', 'configuration-utilities.js');
const arrayutilities = global.routes.include('lib', 'array-utilities.js');

class CloudSearchUtilities {

    constructor(stage){

		    this.stage = configurationutilities.resolveStage(stage);

        this.site_config = configurationutilities.getSiteConfig(this.stage);

        this.max_attempts = 50;

        this.setDomainName();

        this.setCloudsearchDomainEndpoint();

        this.cs = new AWS.CloudSearch({
            region: this.site_config.aws.region,
            apiVersion: '2013-01-01'
        });

        this.csd = new AWS.CloudSearchDomain({
            region: this.site_config.aws.region,
            apiVersion: '2013-01-01',
            endpoint: this.cloudsearchdomain_endpoint
        });

        this.search_fields = [
            'query',
            'cursor',
            'expr',
            'facet',
            'filterQuery',
            'highlight',
            'partial',
            'queryOptions',
            'queryParser',
            'return',
            'size',
            'sort',
            'start',
            'stats'
        ];

        this.suggest_fields = [
            'query',
            'suggester',
            'size'
        ];
    }

    setCloudsearchDomainEndpoint(){

      //Check to see if it's in the cache.
      //If it is, use it!
      //If not, get it, set it
      //Technical Debt:  This needs to be configured.  Critical
      this.cloudsearchdomain_endpoint = 'doc-sixcrm-ep6nfe6jetlzhhawthdojiwqtq.us-east-1.cloudsearch.amazonaws.com';

    }

    setDomainName(){

      du.debug('Set Domain Name');

      if(_.has(this.site_config, 'cloudsearch') && _.has(this.site_config.cloudsearch, 'domainname')){

        this.domainname = this.site_config.cloudsearch.domainname;

        return true;

      }

      eu.throwError('server', 'Unable to determine configured CloudSearch domain name.');

    }

    search(search_parameters){

        return new Promise((resolve, reject) => {

            du.warning(search_parameters);

            let params = {};

            for(var k in search_parameters){
                if(_.contains(this.search_fields, k)){
                    params[k] = search_parameters[k];
                }
            }

            this.csd.search(params, function(error, data) {

                if (error){

                    return reject(error);

                }else{

                    du.debug('Raw search results:', data);

                    return resolve(data);

                }

            });

        });

    }

    suggest(suggest_parameters){

        return new Promise((resolve, reject) => {

            du.warning(suggest_parameters);

            let params = {};

            for(var k in suggest_parameters){
                if(_.contains(this.suggest_fields, k)){
                    params[k] = suggest_parameters[k];
                }
            }

            this.csd.suggest(params, function(error, data) {

                if (error){
                    return reject(error);
                }else{
                    return resolve(data);
                }

            });

        });

    }

    uploadDocuments(structured_documents){

        du.debug('Uploading documents to Cloudsearch', structured_documents);

        return new Promise((resolve, reject) => {

            let params = {
                contentType: 'application/json',
                documents: structured_documents
            };

            du.debug('Cloudsearch Parameters', params);

            this.csd.uploadDocuments(params, function(error, data){
                if(error){
                    du.warning('Cloudsearch error: ', error);
                    return reject(error);
                }
                du.debug('Successful Indexing:', data);
                return resolve(data);
            });

        });

    }

    defineIndexField(index_object){

      du.debug('Define Index Field');

      return new Promise((resolve) => {

        let handle = this.cs.defineIndexField(index_object);

        handle.on('success', function(response) {
          du.info('Create Index Success');
          return resolve(response);
        })
        .on('error', function(response) {
          du.error('Create Index Error', index_object);
          eu.throwError('server', response);
        })
        .send();

      });

    }

    waitFor(domainname, waitfor_status, count){

      return new Promise((resolve, reject) => {

        if(_.isUndefined(count)){
          count = 0;
        }

        if(count > this.max_attempts){

          return reject(eu.getError('server', 'Max attempts reached.'));

        }

        return this.describeDomains([domainname]).then((status) => {

          if(waitfor_status == 'ready'){

            if(status.DomainStatusList[0].Created == true && status.DomainStatusList[0].Processing == false){

              return resolve(true);

            }else{

              count = count + 1;

              du.info(status);

              du.output('Pausing for completion...')

              setTimeout(() => this.waitFor(domainname, waitfor_status, count), 5000);

            }

          }

        });

      });

    }

    describeDomains(domainnames){

      du.debug('Describe Domains');

      return new Promise((resolve) => {

        var parameters = {
          DomainNames: domainnames
        };

        this.cs.describeDomains(parameters, function(error, data) {

          if(error){
            du.error(error);
            eu.throwError('server', error.message);
          }

          return resolve(data);

        });

      });

    }

    createDomain(domainname){

      return new Promise((resolve) => {

        if(_.isUndefined(domainname)){

          domainname = this.domainname

        }

        let parameters = {
          DomainName: domainname,
        };

        let handle = this.cs.createDomain(parameters);

        handle.on('success', function(response) {
          du.info('Create Domain Success');
          return resolve(response);
        })
        .on('error', function(response) {
          du.error('Create Domain Error');
          eu.throwError('server', response);
        })
        .send();

      });

    }

    indexDocuments(domain_name){

      du.debug('Index Documents');

      if(_.isUndefined(domain_name)){
        domain_name = this.domainname;
      }

      return new Promise((resolve, reject) => {

        const parameters = {
          DomainName: domain_name,
        };

        this.cs.indexDocuments(parameters, (error, data) => {

          if (error) {

            du.error(error);

            return reject(error);

          }

          return resolve(data);

        });

      });

    }

    getDomainNames(){

      du.debug('Get Domain Names');

      return new Promise((resolve, reject) => {

        this.cs.listDomainNames((error, data) => {

          if(error){ return reject(error); }

          let domain_names = Object.keys(data.DomainNames || {});

          return resolve(domain_names);

        });

      });

    }

    deleteDomain(domain_name){

      du.debug('Delete Domain');

      if(_.isUndefined(domain_name)){
        domain_name = this.domainname;
      }

      return new Promise((resolve, reject) => {

        let parameters = {
            DomainName: domain_name
        };

        this.cs.deleteDomain(parameters, (error, data) => {

          if(error){ return reject(error); }

          return resolve(data);

        });

      });

    }

}

var csu = new CloudSearchUtilities(process.env.stage);

module.exports = csu;

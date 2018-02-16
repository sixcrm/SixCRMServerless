'use strict'
const AWS = require("aws-sdk");
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const numberutilities = global.SixCRM.routes.include('lib', 'number-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const AWSUtilities = global.SixCRM.routes.include('lib', 'aws-utilities.js');

class CloudSearchUtilities extends AWSUtilities {

    constructor(){

        super();

        this.max_attempts = 200;

        this.setDomainName();

        this.setCloudsearchDomainEndpoint();

        this.cs = new AWS.CloudSearch({
            region: global.SixCRM.configuration.site_config.aws.region,
            apiVersion: '2013-01-01'
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

    setCloudsearchDomainEndpoint() {

      if (objectutilities.hasRecursive(global.SixCRM.configuration.site_config, 'cloudsearch.domainendpoint')) {

          return this.instantiateCSD(global.SixCRM.configuration.site_config.cloudsearch.domainendpoint);

      }

      return global.SixCRM.configuration.getEnvironmentConfig('cloudsearch.domainendpoint').then((endpoint) => {

        if (endpoint) {

            return this.instantiateCSD(endpoint);

        } else {

            return this.saveDomainConfiguration().then((configuration) => this.instantiateCSD(configuration));

        }

      });

    }

    instantiateCSD(endpoint) {

      this.csd = new AWS.CloudSearchDomain({
          region: global.SixCRM.configuration.site_config.aws.region,
          apiVersion: '2013-01-01',
          endpoint: endpoint
      });

      return endpoint;

    }

    CSDExists(){

      du.debug('CSD Exists');

      if(_.has(this, 'csd') && _.isFunction(this.csd.search)){
        return true;
      }

      return false;

    }

    waitForCSD(count){

      du.debug('Wait For CSD');

      count = (_.isUndefined(count))?1:count;

      if(count < 50){

        return timestamp.delay(100)().then(() => {

          if(this.CSDExists()){

            return true;

          }

          return this.waitForCSD((count+1));

        });

      }

      eu.throwError('server', 'Unable to establish connection to Cloudsearch Document endpoint.');

    }

    setDomainName(){

      du.debug('Set Domain Name');

      if (process.env.TEST_MODE === 'true') {
          du.debug('Test Mode');
          this.domainname = 'cloudsearch.local';

          return true;
      }

      if(_.has(global.SixCRM.configuration.site_config, 'cloudsearch') && _.has(global.SixCRM.configuration.site_config.cloudsearch, 'domainname')){

        this.domainname = global.SixCRM.configuration.site_config.cloudsearch.domainname;

        return true;

      }

      eu.throwError('server', 'Unable to determine configured CloudSearch domain name.');

    }

    search(search_parameters){

      du.debug('Search');

      let params = {};

      for(var k in search_parameters){
        if(_.contains(this.search_fields, k)){
          params[k] = search_parameters[k];
        }
      }

      return this.executeStatedSearch(params);

    }

    executeStatedSearch(parameters){

      du.debug('Execute Stated Search');

      return new Promise((resolve, reject) => {

        if(this.CSDExists()){

          du.info(parameters);

           this.csd.search(parameters, function(error, data) {

            if (error){

              return reject(error);

            }else{

              du.debug('Raw search results:', data);

              return resolve(data);

            }

          });

        }else{

          return this.waitForCSD()
          .then(() => this.executeStatedSearch(parameters))
          .then(result => {
              return resolve(result);
          });

        }

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

        return this.waitForCSD()
        .then(() => this.csd.uploadDocuments(params, function(error, data){
          if(error){
              //du.warning('Cloudsearch error: ', error);
              return reject(error);
          }
          //du.debug('Successful Indexing:', data);
          return resolve(data);
        }));

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

    waitFor(waitfor_status, domainname, count){

      du.debug('Wait For');

      return new Promise((resolve) => {

        if(_.isUndefined(domainname) || _.isNull(domainname)){
          domainname = this.domainname;
        }

        if(_.isUndefined(count)){
          count = 0;
        }

        if(count > this.max_attempts){

          if (process.env.TEST_MODE === 'true') {
            du.debug('Test Mode');
            return Promise.resolve(true);
          }

          eu.throwError('server', 'Max attempts reached.');
        }

        return this.describeDomains([domainname]).then((status) => {

          if(waitfor_status == 'ready'){

            if(status.DomainStatusList[0].Created == true && status.DomainStatusList[0].Processing == false){

              return resolve(true);

            }

          }else if(waitfor_status == 'deleted'){

            if(!_.has(status, 'DomainStatusList') || !_.isArray(status.DomainStatusList) || status.DomainStatusList.length < 1){

              return resolve(true);

            }

          }

          count = count + 1;

          du.output('Pausing for completion ('+numberutilities.appendOrdinalSuffix(count)+' attempt...)');

          return timestamp.delay(8000)().then(() => { return this.waitFor(waitfor_status, domainname, count); });

        });

      });

    }

    describeDomains(domainnames){

      du.debug('Describe Domains');

        if (process.env.TEST_MODE === 'true') {
            du.debug('Test Mode');

            return Promise.resolve(this.AWSCallback(null, {DomainStatusList: [{DocService:{Endpoint: 'cloudsearch.domain'}}]}));
        }

      return new Promise((resolve) => {

        if(_.isUndefined(domainnames)){
            domainnames = [this.domainname];
        }

        var parameters = {
          DomainNames: domainnames
        };

        return this.cs.describeDomains(parameters, (error, data) => resolve(this.AWSCallback(error, data)));

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

    //Technical Debt:  This totally doesn't belong here.  This is domain logic.
    saveDomainConfiguration() {

        du.debug('Save Domain Configuration');

        if (process.env.TEST_MODE === 'true') {
            du.debug('Test Mode');
            return Promise.resolve();
        }

        return this.describeDomains([this.domainname]).then((results) => {

            if(objectutilities.hasRecursive(results, 'DomainStatusList.0.DocService.Endpoint')){

                let domain_endpoint = results.DomainStatusList[0].DocService.Endpoint;

                if (!_.isNull(domain_endpoint) && stringutilities.isMatch(domain_endpoint, /^[a-zA-Z0-9\.\-\:]+$/)){

                  global.SixCRM.configuration.setEnvironmentConfig('cloudsearch.domainendpoint', domain_endpoint);

                  return domain_endpoint;

                }else{

                  eu.throwError('server', 'Attempting to set a null or non-compliant cloudshift.domainendpoint configuration globally.');

                }

            }else{

              eu.throwError('server', 'Attempting to set a null cloudshift.domainendpoint configuration globally.');

            }


        });

    };

}

module.exports = new CloudSearchUtilities();

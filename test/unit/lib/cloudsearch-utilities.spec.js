const chai = require('chai');
const expect = chai.expect;
const mockery = require('mockery');

describe('lib/cloudsearch-utilities', () => {

    let test_mode_copy;

    before(() => {
        mockery.resetCache();
        mockery.deregisterAll();

        mockery.enable({
            useCleanCache: true,
            warnOnReplace: false,
            warnOnUnregistered: false
        });

        mockery.registerMock(global.SixCRM.routes.path('lib', 'redis-utilities.js'), {
            set: () => {
                return Promise.resolve();
            },
            get: () => {
                return Promise.resolve('cloudsearch.local');
            }
        });

    });

    beforeEach(() => {
        test_mode_copy = process.env.TEST_MODE;
    });

    afterEach(() => {
        process.env.TEST_MODE = test_mode_copy;
    });

    describe('defineIndexField', () => {

        it('successfully creates index', () => {
            const CloudsearchUtilities = global.SixCRM.routes.include('lib', 'providers/cloudsearch-utilities.js');
            const cloudsearchutilities = new CloudsearchUtilities();

            cloudsearchutilities.cs = {
                describeDomains: function() {
                  return getValidDomains()
                },
                defineIndexField: () => {
                       return {
                           on: (parameters, response) => {
                               response('success');
                           },
                           send: () => {}
                       }
                }
            };

            return cloudsearchutilities.defineIndexField().then((result) => {
                expect(result).to.equal('success');
            });
        });

        it('throws error when index creation failed', () => {
            const CloudsearchUtilities = global.SixCRM.routes.include('lib', 'providers/cloudsearch-utilities.js');
            const cloudsearchutilities = new CloudsearchUtilities();

            cloudsearchutilities.cs = {
                describeDomains: function() {
                  return getValidDomains()
                },
                defineIndexField: () => {
                       return {
                           on: () => {
                               return {
                                   on: (parameters, response) => {
                                       response('error');
                                   }
                               }
                           },
                           send: () => {}
                       }
                }
            };

            return cloudsearchutilities.defineIndexField().catch((error) => {
                expect(error.message).to.equal('[500] error');
            });
        });
    });

    describe('createDomain', () => {

        it('successfully creates domain', () => {
            const CloudsearchUtilities = global.SixCRM.routes.include('lib', 'providers/cloudsearch-utilities.js');
            const cloudsearchutilities = new CloudsearchUtilities();

            cloudsearchutilities.cs = {
                describeDomains: function() {
                  return getValidDomains()
                },
                createDomain: () => {
                       return {
                           on: (parameters, response) => {
                               response('success');
                           },
                           send: () => {}
                       }
                }
            };

            return cloudsearchutilities.createDomain().then((result) => {
                expect(result).to.equal('success');
            });
        });

        it('throws error when domain creation failed', () => {
            const CloudsearchUtilities = global.SixCRM.routes.include('lib', 'providers/cloudsearch-utilities.js');
            const cloudsearchutilities = new CloudsearchUtilities();

            cloudsearchutilities.cs = {
                describeDomains: function() {
                  return getValidDomains()
                },
                createDomain: () => {
                       return {
                           on: () => {
                               return {
                                   on: (parameters, response) => {
                                       response('error');
                                   }
                               }
                           },
                           send: () => {}
                       }
                }
            };

            return cloudsearchutilities.createDomain().catch((error) => {
                expect(error.message).to.equal('[500] error');
            });
        });
    });

    describe('instantiateCSD', () => {

        it('successfully instantiates CSD', () => {

            const CloudsearchUtilities = global.SixCRM.routes.include('lib', 'providers/cloudsearch-utilities.js');
            const cloudsearchutilities = new CloudsearchUtilities();

            expect(cloudsearchutilities.instantiateCSD('an_endpoint')).to.equal('an_endpoint');
        });
    });

    describe('describeDomains', () => {

        it('describe domains', () => {

            let valid_domains = getValidDomains();

            const CloudsearchUtilities = global.SixCRM.routes.include('lib', 'providers/cloudsearch-utilities.js');
            const cloudsearchutilities = new CloudsearchUtilities();

            cloudsearchutilities.cs = {
                describeDomains: function(parameters, callback) {
                    callback(null, valid_domains)
                }
            };

            return cloudsearchutilities.describeDomains().then((result) => {
                expect(result).to.deep.equal(valid_domains);
            });
        });

        it('throws error from cs describeDomains', () => {

            const CloudsearchUtilities = global.SixCRM.routes.include('lib', 'providers/cloudsearch-utilities.js');
            const cloudsearchutilities = new CloudsearchUtilities();

            cloudsearchutilities.cs = {
                describeDomains: function(parameters, callback) {
                    callback('fail', null)
                }
            };

            return cloudsearchutilities.describeDomains().catch((error) => {
                expect(error.message).to.equal('[500] fail');
            });
        });
    });

    describe('waitFor', () => {

        it('returns true when status is ready', () => {

            const CloudsearchUtilities = global.SixCRM.routes.include('lib', 'providers/cloudsearch-utilities.js');
            const cloudsearchutilities = new CloudsearchUtilities();

            cloudsearchutilities.cs = {
                describeDomains: function(parameters, callback) {
                    callback(null, {DomainStatusList: [{Created: true, Processing: false}]})
                }
            };

            //any number that is not higher than 200
            return cloudsearchutilities.waitFor('ready', null, 200).then((result) => {
                expect(result).to.be.true;
            });
        });

        it('returns true when status is deleted', () => {

            const CloudsearchUtilities = global.SixCRM.routes.include('lib', 'providers/cloudsearch-utilities.js');
            const cloudsearchutilities = new CloudsearchUtilities();

            cloudsearchutilities.cs = {
                describeDomains: function(parameters, callback) {
                    callback(null, {})
                }
            };

            //any number that is not higher than 200
            return cloudsearchutilities.waitFor('deleted', null, 200).then((result) => {
                expect(result).to.be.true;
            });
        });

        it('throws error when max attempt is reached', () => {
            const CloudsearchUtilities = global.SixCRM.routes.include('lib', 'providers/cloudsearch-utilities.js');
            const cloudsearchutilities = new CloudsearchUtilities();

            //any number higher than 200
            return cloudsearchutilities.waitFor('any_status', 'a_domain_name', 201).catch((error) => {
                expect(error.message).to.equal('[500] Max attempts reached.');
            });
        });
    });

    describe('getDomainNames', () => {

        it('returns object keys for domain names', () => {
            const CloudsearchUtilities = global.SixCRM.routes.include('lib', 'providers/cloudsearch-utilities.js');
            const cloudsearchutilities = new CloudsearchUtilities();

            cloudsearchutilities.cs = {
                describeDomains: function() {
                  return getValidDomains()
                },
                listDomainNames: function(callback) {
                    callback(null, {DomainNames: 'a_domain_name'})
                }
            };

            return cloudsearchutilities.getDomainNames().then((result) => {
                expect(result).to.deep.equal(["0","1","2","3","4","5","6","7","8","9","10","11","12"] );
            });
        });

        it('throws error when domain name is not found', () => {
            const CloudsearchUtilities = global.SixCRM.routes.include('lib', 'providers/cloudsearch-utilities.js');
            const cloudsearchutilities = new CloudsearchUtilities();

            cloudsearchutilities.cs = {
                describeDomains: function() {
                  return getValidDomains()
                },
                listDomainNames: function(callback) {
                    callback('fail', null)
                }
            };

            return cloudsearchutilities.getDomainNames().catch((error) => {
                expect(error).to.equal('fail');
            });
        });
    });

    describe('deleteDomain', () => {

        it('deletes domain', () => {
            const CloudsearchUtilities = global.SixCRM.routes.include('lib', 'providers/cloudsearch-utilities.js');
            const cloudsearchutilities = new CloudsearchUtilities();

            cloudsearchutilities.cs = {
                describeDomains: function() {
                  return getValidDomains()
                },
                deleteDomain: function(parameters, callback) {
                    callback(null, 'success')
                }
            };

            return cloudsearchutilities.deleteDomain().then((result) => {
                expect(result).to.equal('success');
            });
        });

        it('throws error if domain is not deleted', () => {
            const CloudsearchUtilities = global.SixCRM.routes.include('lib', 'providers/cloudsearch-utilities.js');
            const cloudsearchutilities = new CloudsearchUtilities();

            cloudsearchutilities.cs = {
                describeDomains: function() {
                  return getValidDomains()
                },
                deleteDomain: function(parameters, callback) {
                    callback('fail', null)
                }
            };

            return cloudsearchutilities.deleteDomain().catch((error) => {
                expect(error).to.equal('fail');
            });
        });
    });

    describe('indexDocuments', () => {

        it('index documents', () => {
            const CloudsearchUtilities = global.SixCRM.routes.include('lib', 'providers/cloudsearch-utilities.js');
            const cloudsearchutilities = new CloudsearchUtilities();

            cloudsearchutilities.cs = {
                describeDomains: function() {
                  return getValidDomains()
                },
                indexDocuments: function(parameters, callback) {
                    callback(null, 'success')
                }
            };

            return cloudsearchutilities.indexDocuments().then((result) => {
                expect(result).to.equal('success');
            });
        });

        it('throws error from cs indexDocuments', () => {
            const CloudsearchUtilities = global.SixCRM.routes.include('lib', 'providers/cloudsearch-utilities.js');
            const cloudsearchutilities = new CloudsearchUtilities();

            cloudsearchutilities.cs = {
                describeDomains: function() {
                  return getValidDomains()
                },
                indexDocuments: function(parameters, callback) {
                    callback('fail', null)
                }
            };

            return cloudsearchutilities.indexDocuments().catch((error) => {
                expect(error).to.equal('fail');
            });
        });
    });

    describe('uploadDocuments', () => {

        it('uploads documents', () => {
            const CloudsearchUtilities = global.SixCRM.routes.include('lib', 'providers/cloudsearch-utilities.js');
            const cloudsearchutilities = new CloudsearchUtilities();

            cloudsearchutilities.csd = {
                search: function(parameters, callback) {
                    callback(null, 'success')
                },
                uploadDocuments: function(parameters, callback) {
                    callback(null, 'success')
                }
            };

            return cloudsearchutilities.uploadDocuments().then((result) => {
                expect(result).to.equal('success');
            });
        });

        it('throws error from csd uploadDocuments', () => {
            const CloudsearchUtilities = global.SixCRM.routes.include('lib', 'providers/cloudsearch-utilities.js');
            const cloudsearchutilities = new CloudsearchUtilities();

            cloudsearchutilities.csd = {
                search: function(parameters, callback) {
                    callback(null, 'success')
                },
                uploadDocuments: function(parameters, callback) {
                    callback('fail', null)
                }
            };

            return cloudsearchutilities.uploadDocuments().catch((error) => {
                expect(error).to.equal('fail');
            });
        });
    });

    describe('suggest', () => {

        it('returns result from csd suggest', () => {
            const CloudsearchUtilities = global.SixCRM.routes.include('lib', 'providers/cloudsearch-utilities.js');
            const cloudsearchutilities = new CloudsearchUtilities();

            cloudsearchutilities.csd = {
                suggest: function(parameters, callback) {
                    callback(null, 'success')
                }
            };

            //valid search field 'size'
            return cloudsearchutilities.suggest({size: 'a_size'}).then((result) => {
                expect(result).to.equal('success');
            });
        });

        it('throws error from csd suggest', () => {
            const CloudsearchUtilities = global.SixCRM.routes.include('lib', 'providers/cloudsearch-utilities.js');
            const cloudsearchutilities = new CloudsearchUtilities();

            cloudsearchutilities.csd = {
                suggest: function(parameters, callback) {
                    callback('fail', null)
                }
            };

            //valid search field 'size'
            return cloudsearchutilities.suggest({size: 'a_size'}).catch((error) => {
                expect(error).to.equal('fail');
            });
        });
    });

    describe('executeStatedSearch', () => {

        it('executes stated search', () => {
            const CloudsearchUtilities = global.SixCRM.routes.include('lib', 'providers/cloudsearch-utilities.js');
            const cloudsearchutilities = new CloudsearchUtilities();

            cloudsearchutilities.csd = {
                search: function(parameters, callback) {
                    callback(null, 'success')
                }
            };

            return cloudsearchutilities.executeStatedSearch('any_params').then((result) => {
                expect(result).to.equal('success');
            });
        });

        it('throws error from csd search', () => {
            const CloudsearchUtilities = global.SixCRM.routes.include('lib', 'providers/cloudsearch-utilities.js');
            const cloudsearchutilities = new CloudsearchUtilities();

            cloudsearchutilities.csd = {
                search: function(parameters, callback) {
                    callback('fail', null)
                }
            };

            return cloudsearchutilities.executeStatedSearch('any_params').catch((error) => {
                expect(error).to.equal('fail');
            });
        });
    });

    describe('search', () => {

        it('executes search', () => {
            const CloudsearchUtilities = global.SixCRM.routes.include('lib', 'providers/cloudsearch-utilities.js');
            const cloudsearchutilities = new CloudsearchUtilities();

            cloudsearchutilities.csd = {
                search: function(parameters, callback) {
                    callback(null, 'success')
                }
            };

            //valid search field 'size'
            return cloudsearchutilities.search({size: 'a_size'}).then((result) => {
                expect(result).to.equal('success');
            });
        });

        it('throws error from csd search', () => {
            const CloudsearchUtilities = global.SixCRM.routes.include('lib', 'providers/cloudsearch-utilities.js');
            const cloudsearchutilities = new CloudsearchUtilities();

            cloudsearchutilities.csd = {
                search: function(parameters, callback) {
                    callback('fail', null)
                }
            };

            //valid search field 'size'
            return cloudsearchutilities.search({size: 'a_size'}).catch((error) => {
                expect(error).to.equal('fail');
            });
        });
    });

    describe('waitForCSD', () => {

        it('wait for CSD connection', () => {
            const CloudsearchUtilities = global.SixCRM.routes.include('lib', 'providers/cloudsearch-utilities.js');
            const cloudsearchutilities = new CloudsearchUtilities();

            cloudsearchutilities.csd = {
                search: function(parameters, callback) {
                    callback(null, 'success')
                }
            };

            //when count number is less than 50
            return cloudsearchutilities.waitForCSD(49).then((result) => {
                expect(result).to.be.true;
            });
        });

        it('throws error when connection with CSD is not established', () => {
            const CloudsearchUtilities = global.SixCRM.routes.include('lib', 'providers/cloudsearch-utilities.js');
            const cloudsearchutilities = new CloudsearchUtilities();

            //when count number is more than or equal to 50 throw error
            try{
                cloudsearchutilities.waitForCSD(51)
            }catch(error){
                expect(error.message).to.equal('[500] Unable to establish connection to Cloudsearch Document endpoint.');
            }
        });
    });

    describe('setDomainName', () => {

        it('successfully sets domain name for test mode', () => {

            process.env.TEST_MODE = 'true';

            const CloudsearchUtilities = global.SixCRM.routes.include('lib', 'providers/cloudsearch-utilities.js');
            const cloudsearchutilities = new CloudsearchUtilities();

            let result = cloudsearchutilities.setDomainName();

            expect(result).to.be.true;
            expect(cloudsearchutilities.domainname).to.equal('cloudsearch.local');
        });
    });

    describe('CSDExists', () => {

        it('returns true when CSD exists', () => {

            const CloudsearchUtilities = global.SixCRM.routes.include('lib', 'providers/cloudsearch-utilities.js');
            const cloudsearchutilities = new CloudsearchUtilities();

            expect(cloudsearchutilities.CSDExists()).to.be.true;
        });

        it('returns false when CSD does not exist', () => {

            const CloudsearchUtilities = global.SixCRM.routes.include('lib', 'providers/cloudsearch-utilities.js');
            const cloudsearchutilities = new CloudsearchUtilities();

            delete cloudsearchutilities.csd;

            expect(cloudsearchutilities.CSDExists()).to.be.false;
        });
    });

    function getValidDomains() {
        return {DomainStatusList: [{DocService:{Endpoint: 'cloudsearch.domain'}}]};
    }
});

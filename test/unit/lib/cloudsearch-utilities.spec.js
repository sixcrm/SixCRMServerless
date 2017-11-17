const chai = require('chai');
const expect = chai.expect;
const mockery = require('mockery');

describe('lib/cloudsearch-utilities', () => {

    before(() => {
        mockery.enable({
            useCleanCache: true,
            warnOnReplace: false,
            warnOnUnregistered: false
        });
    });

    afterEach(() => {
        mockery.resetCache();
    });

    after(() => {
        mockery.deregisterAll();
    });

    describe('defineIndexField', () => {

        it('successfully creates index', () => {
            const cloudsearchutilities = global.SixCRM.routes.include('lib', 'cloudsearch-utilities.js');

            cloudsearchutilities.cs = {
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
            const cloudsearchutilities = global.SixCRM.routes.include('lib', 'cloudsearch-utilities.js');

            cloudsearchutilities.cs = {
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
            const cloudsearchutilities = global.SixCRM.routes.include('lib', 'cloudsearch-utilities.js');

            cloudsearchutilities.cs = {
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
            const cloudsearchutilities = global.SixCRM.routes.include('lib', 'cloudsearch-utilities.js');

            cloudsearchutilities.cs = {
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

            const cloudsearchutilities = global.SixCRM.routes.include('lib', 'cloudsearch-utilities.js');

            expect(cloudsearchutilities.instantiateCSD('an_endpoint')).to.equal('an_endpoint');
        });
    });

    describe('describeDomains', () => {

        it('describe domains', () => {
            const cloudsearchutilities = global.SixCRM.routes.include('lib', 'cloudsearch-utilities.js');

            cloudsearchutilities.cs = {
                describeDomains: function(parameters, callback) {
                    callback(null, 'success')
                }
            };

            return cloudsearchutilities.describeDomains().then((result) => {
                expect(result).to.equal('success');
            });
        });

        it('throws error from cs describeDomains', () => {
            const cloudsearchutilities = global.SixCRM.routes.include('lib', 'cloudsearch-utilities.js');

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
            const cloudsearchutilities = global.SixCRM.routes.include('lib', 'cloudsearch-utilities.js');

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
            const cloudsearchutilities = global.SixCRM.routes.include('lib', 'cloudsearch-utilities.js');

            cloudsearchutilities.cs = {
                describeDomains: function(parameters, callback) {
                    callback(null, 'success')
                }
            };

            //any number that is not higher than 200
            return cloudsearchutilities.waitFor('deleted', null, 200).then((result) => {
                expect(result).to.be.true;
            });
        });

        it('throws error when max attempt is reached', () => {
            const cloudsearchutilities = global.SixCRM.routes.include('lib', 'cloudsearch-utilities.js');

            //any number higher than 200
            return cloudsearchutilities.waitFor('any_status', 'a_domain_name', 201).catch((error) => {
                expect(error.message).to.equal('[500] Max attempts reached.');
            });
        });
    });

    describe('getDomainNames', () => {

        it('returns object keys for domain names', () => {
            const cloudsearchutilities = global.SixCRM.routes.include('lib', 'cloudsearch-utilities.js');

            cloudsearchutilities.cs = {
                listDomainNames: function(callback) {
                    callback(null, {DomainNames: 'a_domain_name'})
                }
            };

            return cloudsearchutilities.getDomainNames().then((result) => {
                expect(result).to.deep.equal(["0","1","2","3","4","5","6","7","8","9","10","11","12"] );
            });
        });

        it('throws error when domain name is not found', () => {
            const cloudsearchutilities = global.SixCRM.routes.include('lib', 'cloudsearch-utilities.js');

            cloudsearchutilities.cs = {
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
            const cloudsearchutilities = global.SixCRM.routes.include('lib', 'cloudsearch-utilities.js');

            cloudsearchutilities.cs = {
                deleteDomain: function(parameters, callback) {
                    callback(null, 'success')
                }
            };

            return cloudsearchutilities.deleteDomain().then((result) => {
                expect(result).to.equal('success');
            });
        });

        it('throws error if domain is not deleted', () => {
            const cloudsearchutilities = global.SixCRM.routes.include('lib', 'cloudsearch-utilities.js');

            cloudsearchutilities.cs = {
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
            const cloudsearchutilities = global.SixCRM.routes.include('lib', 'cloudsearch-utilities.js');

            cloudsearchutilities.cs = {
                indexDocuments: function(parameters, callback) {
                    callback(null, 'success')
                }
            };

            return cloudsearchutilities.indexDocuments().then((result) => {
                expect(result).to.equal('success');
            });
        });

        it('throws error from cs indexDocuments', () => {
            const cloudsearchutilities = global.SixCRM.routes.include('lib', 'cloudsearch-utilities.js');

            cloudsearchutilities.cs = {
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
            const cloudsearchutilities = global.SixCRM.routes.include('lib', 'cloudsearch-utilities.js');

            cloudsearchutilities.csd = {
                uploadDocuments: function(parameters, callback) {
                    callback(null, 'success')
                }
            };

            return cloudsearchutilities.uploadDocuments().then((result) => {
                expect(result).to.equal('success');
            });
        });

        it('throws error from csd uploadDocuments', () => {
            const cloudsearchutilities = global.SixCRM.routes.include('lib', 'cloudsearch-utilities.js');

            cloudsearchutilities.csd = {
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
            const cloudsearchutilities = global.SixCRM.routes.include('lib', 'cloudsearch-utilities.js');

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
            const cloudsearchutilities = global.SixCRM.routes.include('lib', 'cloudsearch-utilities.js');

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
            const cloudsearchutilities = global.SixCRM.routes.include('lib', 'cloudsearch-utilities.js');

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
            const cloudsearchutilities = global.SixCRM.routes.include('lib', 'cloudsearch-utilities.js');

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
            const cloudsearchutilities = global.SixCRM.routes.include('lib', 'cloudsearch-utilities.js');

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
            const cloudsearchutilities = global.SixCRM.routes.include('lib', 'cloudsearch-utilities.js');

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
            const cloudsearchutilities = global.SixCRM.routes.include('lib', 'cloudsearch-utilities.js');

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
            const cloudsearchutilities = global.SixCRM.routes.include('lib', 'cloudsearch-utilities.js');

            //when count number is more than or equal to 50 throw error
            try{
                cloudsearchutilities.waitForCSD(51)
            }catch(error){
                expect(error.message).to.equal('[500] Unable to establish connection to Cloudsearch Document endpoint.');
            }
        });
    });
});
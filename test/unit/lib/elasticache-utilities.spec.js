const chai = require('chai');
const expect = chai.expect;

describe('lib/elasticache-utilities', () => {

    describe('describeClusters', () => {

        it('returns data from elasticache describe clusters', () => {
            const elasticacheutilities = global.SixCRM.routes.include('lib', 'elasticache-utilities.js');

            elasticacheutilities.elasticache = {
                describeCacheClusters: function(params, callback) {
                    callback(null, 'a_cluster_data')
                }
            };

            return elasticacheutilities.describeClusters('any_params').then((result) => {
                expect(result).to.equal('a_cluster_data');
            });
        });

        it('throws error from elasticache describe clusters', () => {
            const elasticacheutilities = global.SixCRM.routes.include('lib', 'elasticache-utilities.js');

            elasticacheutilities.elasticache = {
                describeCacheClusters: function(params, callback) {
                    callback('fail', null)
                }
            };

            return elasticacheutilities.describeClusters('any_params').catch((error) => {
                expect(error.message).to.equal('[500] fail');
            });
        });

        it('throws CacheClusterNotFound error from elasticache describe clusters', () => {
            const elasticacheutilities = global.SixCRM.routes.include('lib', 'elasticache-utilities.js');

            elasticacheutilities.elasticache = {
                describeCacheClusters: function(params, callback) {
                    callback({code: 'CacheClusterNotFound'}, null)
                }
            };

            return elasticacheutilities.describeClusters('any_params').then((result) => {
                expect(result).to.equal(null);
            });
        });
    });

    describe('destroyCluster', () => {

        it('returns success from elasticache delete clusters', () => {
            const elasticacheutilities = global.SixCRM.routes.include('lib', 'elasticache-utilities.js');

            elasticacheutilities.elasticache = {
                deleteCacheCluster: function(params, callback) {
                    callback(null, 'success')
                }
            };

            return elasticacheutilities.destroyCluster('any_params').then((result) => {
                expect(result).to.equal('success');
            });
        });

        it('throws error from elasticache delete clusters', () => {
            const elasticacheutilities = global.SixCRM.routes.include('lib', 'elasticache-utilities.js');

            elasticacheutilities.elasticache = {
                deleteCacheCluster: function(params, callback) {
                    callback('fail', null)
                }
            };

            return elasticacheutilities.destroyCluster('any_params').catch((error) => {
                expect(error.message).to.equal('[500] fail');
            });
        });
    });

    describe('createCluster', () => {

        it('returns success from elasticache create cluster', () => {
            const elasticacheutilities = global.SixCRM.routes.include('lib', 'elasticache-utilities.js');

            elasticacheutilities.elasticache = {
                createCacheCluster: function(params, callback) {
                    callback(null, 'success')
                }
            };

            return elasticacheutilities.createCluster('any_params').then((result) => {
                expect(result).to.equal('success');
            });
        });

        it('throws error from elasticache create cluster', () => {
            const elasticacheutilities = global.SixCRM.routes.include('lib', 'elasticache-utilities.js');

            elasticacheutilities.elasticache = {
                createCacheCluster: function(params, callback) {
                    callback('fail', null)
                }
            };

            return elasticacheutilities.createCluster('any_params').catch((error) => {
                expect(error.message).to.equal('[500] fail');
            });
        });
    });

    describe('waitFor', () => {

        it('returns success from elasticache wait for cluster', () => {
            const elasticacheutilities = global.SixCRM.routes.include('lib', 'elasticache-utilities.js');

            delete elasticacheutilities.clusterStati; //remove default clusterStati

            elasticacheutilities.clusterStati = {status: 'a_status'}; //add example status to clusterStati

            elasticacheutilities.elasticache = {
                waitFor: function(status, params, callback) {
                    callback(null, 'success')
                }
            };

            return elasticacheutilities.waitFor('any_params', 'a_status').then((result) => {
                expect(result).to.equal('success');
            });
        });

        it('throws error from elasticache wait for cluster', () => {
            const elasticacheutilities = global.SixCRM.routes.include('lib', 'elasticache-utilities.js');

            delete elasticacheutilities.clusterStati; //remove default clusterStati

            elasticacheutilities.clusterStati = {status: 'a_status'}; //add example status to clusterStati

            elasticacheutilities.elasticache = {
                waitFor: function(status, params, callback) {
                    callback('fail', null)
                }
            };

            return elasticacheutilities.waitFor('any_params', 'a_status').catch((error) => {
                expect(error.message).to.equal('[500] fail');
            });
        });

        it('throws error if cluster status type is unknown', () => {

            const elasticacheutilities = global.SixCRM.routes.include('lib', 'elasticache-utilities.js');

            delete elasticacheutilities.clusterStati;

            return elasticacheutilities.waitFor('any_params', 'a_status').catch((error) => {
                expect(error.message).to.equal('[500] Unknown status type.');
            });
        });
    });
});
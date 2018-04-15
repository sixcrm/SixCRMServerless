const chai = require('chai');
const expect = chai.expect;

describe('controllers/providers/elasticache-provider', () => {

	describe('describeClusters', () => {

		it('returns data from elasticache describe clusters', () => {
			const ElasticacheProvider = global.SixCRM.routes.include('controllers', 'providers/elasticache-provider.js');
			const elasticacheprovider = new ElasticacheProvider();

			elasticacheprovider.elasticache = {
				describeCacheClusters: function(params, callback) {
					callback(null, 'a_cluster_data')
				}
			};

			return elasticacheprovider.describeClusters('any_params').then((result) => {
				expect(result).to.equal('a_cluster_data');
			});
		});

		it('throws error from elasticache describe clusters', () => {
			const ElasticacheProvider = global.SixCRM.routes.include('controllers', 'providers/elasticache-provider.js');
			const elasticacheprovider = new ElasticacheProvider();

			elasticacheprovider.elasticache = {
				describeCacheClusters: function(params, callback) {
					callback('fail', null)
				}
			};

			return elasticacheprovider.describeClusters('any_params').catch((error) => {
				expect(error.message).to.equal('[500] fail');
			});
		});

		it('throws CacheClusterNotFound error from elasticache describe clusters', () => {
			const ElasticacheProvider = global.SixCRM.routes.include('controllers', 'providers/elasticache-provider.js');
			const elasticacheprovider = new ElasticacheProvider();

			elasticacheprovider.elasticache = {
				describeCacheClusters: function(params, callback) {
					callback({code: 'CacheClusterNotFound'}, null)
				}
			};

			return elasticacheprovider.describeClusters('any_params').then((result) => {
				expect(result).to.equal(null);
			});
		});
	});

	describe('destroyCluster', () => {

		it('returns success from elasticache delete clusters', () => {
			const ElasticacheProvider = global.SixCRM.routes.include('controllers', 'providers/elasticache-provider.js');
			const elasticacheprovider = new ElasticacheProvider();

			elasticacheprovider.elasticache = {
				deleteCacheCluster: function(params, callback) {
					callback(null, 'success')
				}
			};

			return elasticacheprovider.destroyCluster('any_params').then((result) => {
				expect(result).to.equal('success');
			});
		});

		it('throws error from elasticache delete clusters', () => {
			const ElasticacheProvider = global.SixCRM.routes.include('controllers', 'providers/elasticache-provider.js');
			const elasticacheprovider = new ElasticacheProvider();

			elasticacheprovider.elasticache = {
				deleteCacheCluster: function(params, callback) {
					callback('fail', null)
				}
			};

			return elasticacheprovider.destroyCluster('any_params').catch((error) => {
				expect(error.message).to.equal('[500] fail');
			});
		});
	});

	describe('createCluster', () => {

		it('returns success from elasticache create cluster', () => {
			const ElasticacheProvider = global.SixCRM.routes.include('controllers', 'providers/elasticache-provider.js');
			const elasticacheprovider = new ElasticacheProvider();

			elasticacheprovider.elasticache = {
				createCacheCluster: function(params, callback) {
					callback(null, 'success')
				}
			};

			return elasticacheprovider.createCluster('any_params').then((result) => {
				expect(result).to.equal('success');
			});
		});

		it('throws error from elasticache create cluster', () => {
			const ElasticacheProvider = global.SixCRM.routes.include('controllers', 'providers/elasticache-provider.js');
			const elasticacheprovider = new ElasticacheProvider();

			elasticacheprovider.elasticache = {
				createCacheCluster: function(params, callback) {
					callback('fail', null)
				}
			};

			return elasticacheprovider.createCluster('any_params').catch((error) => {
				expect(error.message).to.equal('[500] fail');
			});
		});
	});

	describe('waitFor', () => {

		it('returns success from elasticache wait for cluster', () => {
			const ElasticacheProvider = global.SixCRM.routes.include('controllers', 'providers/elasticache-provider.js');
			const elasticacheprovider = new ElasticacheProvider();

			delete elasticacheprovider.clusterStati; //remove default clusterStati

			elasticacheprovider.clusterStati = {status: 'a_status'}; //add example status to clusterStati

			elasticacheprovider.elasticache = {
				waitFor: function(status, params, callback) {
					callback(null, 'success')
				}
			};

			return elasticacheprovider.waitFor('any_params', 'a_status').then((result) => {
				expect(result).to.equal('success');
			});
		});

		it('throws error from elasticache wait for cluster', () => {
			const ElasticacheProvider = global.SixCRM.routes.include('controllers', 'providers/elasticache-provider.js');
			const elasticacheprovider = new ElasticacheProvider();

			delete elasticacheprovider.clusterStati; //remove default clusterStati

			elasticacheprovider.clusterStati = {status: 'a_status'}; //add example status to clusterStati

			elasticacheprovider.elasticache = {
				waitFor: function(status, params, callback) {
					callback('fail', null)
				}
			};

			return elasticacheprovider.waitFor('any_params', 'a_status').catch((error) => {
				expect(error.message).to.equal('[500] fail');
			});
		});

		it('throws error if cluster status type is unknown', () => {

			const ElasticacheProvider = global.SixCRM.routes.include('controllers', 'providers/elasticache-provider.js');
			const elasticacheprovider = new ElasticacheProvider();

			delete elasticacheprovider.clusterStati;

			return elasticacheprovider.waitFor('any_params', 'a_status').catch((error) => {
				expect(error.message).to.equal('[500] Unknown status type.');
			});
		});
	});
});

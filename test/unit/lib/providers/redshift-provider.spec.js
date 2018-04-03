const chai = require('chai');
const expect = chai.expect;

describe('lib/providers/redshift-provider', () => {

  describe('createClusterSnapshot', () => {

    it('successfully triggers a cluster snapshot with no arguments', () => {

      const RedshiftProvider = global.SixCRM.routes.include('lib', 'providers/redshift-provider.js');
      const redshiftprovider = new RedshiftProvider();

      let response = {
        Snapshot:{
          Status:'creating'
        }
      };

      redshiftprovider.redshift = {
          createClusterSnapshot: function(params, callback) {
            callback(null, response);
          }
      };

      return redshiftprovider.createClusterSnapshot().then(result => {
        expect(result).to.deep.equal(response);
      });

    });

    it('successfully triggers a cluster snapshot with arguments', () => {

      const RedshiftProvider = global.SixCRM.routes.include('lib', 'providers/redshift-provider.js');
      const redshiftprovider = new RedshiftProvider();

      let response = {
        Snapshot:{
          Status:'creating'
        }
      };

      let parameters = {
        ClusterIdentifier: 'testci',
        SnapshotIdentifier: 'testci',
      };

      redshiftprovider.redshift = {
          createClusterSnapshot: function(params, callback) {
            expect(params.ClusterIdentifier).to.equal(parameters.ClusterIdentifier);
            expect(params.ClusterIdentifier).to.equal(parameters.SnapshotIdentifier);
            callback(null, response);
          }
      };

      return redshiftprovider.createClusterSnapshot(parameters).then(result => {
        expect(result).to.deep.equal(response);
      });

    });

  });

    describe('clusterExists', () => {

        it('returns true when cluster array exists in data', () => {

            const RedshiftProvider = global.SixCRM.routes.include('lib', 'providers/redshift-provider.js');
            const redshiftprovider = new RedshiftProvider();

            redshiftprovider.redshift = {
                describeClusters: function(params, callback) {
                    callback(null, {Clusters: ['a_cluster']})
                }
            };

            return redshiftprovider.clusterExists('any_params').then((result) => {
                expect(result).to.be.true;
            });
        });

        it('returns false when cluster doesn\'t exist in data', () => {

            const RedshiftProvider = global.SixCRM.routes.include('lib', 'providers/redshift-provider.js');
            const redshiftprovider = new RedshiftProvider();

            redshiftprovider.redshift = {
                describeClusters: function(params, callback) {
                    callback(null, 'data_without_cluster')
                }
            };

            return redshiftprovider.clusterExists('any_params').then((result) => {
                expect(result).to.be.false;
            });
        });

        it('returns false when error is thrown from redshift describe clusters', () => {

            const RedshiftProvider = global.SixCRM.routes.include('lib', 'providers/redshift-provider.js');
            const redshiftprovider = new RedshiftProvider();

            redshiftprovider.redshift = {
                describeClusters: function(params, callback) {
                    callback('fail', null)
                }
            };

            return redshiftprovider.clusterExists('any_params').then((result) => {
                expect(result).to.be.false;
            });
        });
    });

    describe('describeCluster', () => {

        it('returns data from redshift describe clusters', () => {

            const RedshiftProvider = global.SixCRM.routes.include('lib', 'providers/redshift-provider.js');
            const redshiftprovider = new RedshiftProvider();

            redshiftprovider.redshift = {
                describeClusters: function(params, callback) {
                    callback(null, 'a_cluster_data')
                }
            };

            return redshiftprovider.describeCluster('any_params').then((result) => {
                expect(result).to.equal('a_cluster_data');
            });
        });

        it('throws error from redshift describe clusters', () => {

            const RedshiftProvider = global.SixCRM.routes.include('lib', 'providers/redshift-provider.js');
            const redshiftprovider = new RedshiftProvider();

            redshiftprovider.redshift = {
                describeClusters: function(params, callback) {
                    callback('fail', null)
                }
            };

            return redshiftprovider.describeCluster('any_params').catch((error) => {
                expect(error).to.equal('fail');
            });
        });
    });

    describe('deleteCluster', () => {

        it('returns success from redshift delete clusters', () => {

            const RedshiftProvider = global.SixCRM.routes.include('lib', 'providers/redshift-provider.js');
            const redshiftprovider = new RedshiftProvider();

            redshiftprovider.redshift = {
                deleteCluster: function(params, callback) {
                    callback(null, 'success')
                }
            };

            return redshiftprovider.deleteCluster('any_params').then((result) => {
                expect(result).to.equal('success');
            });
        });

        it('throws error from redshift delete clusters', () => {

            const RedshiftProvider = global.SixCRM.routes.include('lib', 'providers/redshift-provider.js');
            const redshiftprovider = new RedshiftProvider();

            redshiftprovider.redshift = {
                deleteCluster: function(params, callback) {
                    callback('fail', null)
                }
            };

            return redshiftprovider.deleteCluster('any_params').catch((error) => {
                expect(error).to.equal('fail');
            });
        });
    });

    describe('createCluster', () => {

        it('returns success from redshift create cluster', () => {

            const RedshiftProvider = global.SixCRM.routes.include('lib', 'providers/redshift-provider.js');
            const redshiftprovider = new RedshiftProvider();

            redshiftprovider.redshift = {
                createCluster: function(params, callback) {
                    callback(null, 'success')
                }
            };

            return redshiftprovider.createCluster('any_params').then((result) => {
                expect(result).to.equal('success');
            });
        });

        it('throws error from redshift create cluster', () => {

            const RedshiftProvider = global.SixCRM.routes.include('lib', 'providers/redshift-provider.js');
            const redshiftprovider = new RedshiftProvider();

            redshiftprovider.redshift = {
                createCluster: function(params, callback) {
                    callback('fail', null)
                }
            };

            return redshiftprovider.createCluster('any_params').catch((error) => {
                expect(error).to.equal('fail');
            });
        });
    });

    describe('waitForCluster', () => {

        it('returns success from redshift wait for cluster', () => {

            const RedshiftProvider = global.SixCRM.routes.include('lib', 'providers/redshift-provider.js');
            const redshiftprovider = new RedshiftProvider();

            redshiftprovider.redshift = {
                waitFor: function(state, params, callback) {
                    callback(null, 'success')
                }
            };

            return redshiftprovider.waitForCluster('a_state', 'any_params').then((result) => {
                expect(result).to.equal('success');
            });
        });

        it('throws error from redshift wait for cluster', () => {

            const RedshiftProvider = global.SixCRM.routes.include('lib', 'providers/redshift-provider.js');
            const redshiftprovider = new RedshiftProvider();

            redshiftprovider.redshift = {
                waitFor: function(state, params, callback) {
                    callback('fail', null)
                }
            };

            return redshiftprovider.waitForCluster('a_state', 'any_params').catch((error) => {
                expect(error).to.equal('fail');
            });
        });
    });
});

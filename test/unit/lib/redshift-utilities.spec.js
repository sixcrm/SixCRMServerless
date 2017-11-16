const chai = require('chai');
const expect = chai.expect;

describe('lib/redshift-utilities', () => {

    describe('clusterExists', () => {

        it('returns true when cluster array exists in data', () => {
            const redshiftutilities = global.SixCRM.routes.include('lib', 'redshift-utilities.js');

            redshiftutilities.redshift = {
                describeClusters: function(params, callback) {
                    callback(null, {Clusters: ['a_cluster']})
                }
            };

            return redshiftutilities.clusterExists('any_params').then((result) => {
                expect(result).to.be.true;
            });
        });

        it('returns false when cluster doesn\'t exist in data', () => {
            const redshiftutilities = global.SixCRM.routes.include('lib', 'redshift-utilities.js');

            redshiftutilities.redshift = {
                describeClusters: function(params, callback) {
                    callback(null, 'data_without_cluster')
                }
            };

            return redshiftutilities.clusterExists('any_params').then((result) => {
                expect(result).to.be.false;
            });
        });

        it('returns false when error is thrown from redshift describe clusters', () => {
            const redshiftutilities = global.SixCRM.routes.include('lib', 'redshift-utilities.js');

            redshiftutilities.redshift = {
                describeClusters: function(params, callback) {
                    callback('fail', null)
                }
            };

            return redshiftutilities.clusterExists('any_params').then((result) => {
                expect(result).to.be.false;
            });
        });
    });

    describe('describeCluster', () => {

        it('returns data from redshift describe clusters', () => {
            const redshiftutilities = global.SixCRM.routes.include('lib', 'redshift-utilities.js');

            redshiftutilities.redshift = {
                describeClusters: function(params, callback) {
                    callback(null, 'a_cluster_data')
                }
            };

            return redshiftutilities.describeCluster('any_params').then((result) => {
                expect(result).to.equal('a_cluster_data');
            });
        });

        it('throws error from redshift describe clusters', () => {
            const redshiftutilities = global.SixCRM.routes.include('lib', 'redshift-utilities.js');

            redshiftutilities.redshift = {
                describeClusters: function(params, callback) {
                    callback('fail', null)
                }
            };

            return redshiftutilities.describeCluster('any_params').catch((error) => {
                expect(error).to.equal('fail');
            });
        });
    });

    describe('deleteCluster', () => {

        it('returns success from redshift delete clusters', () => {
            const redshiftutilities = global.SixCRM.routes.include('lib', 'redshift-utilities.js');

            redshiftutilities.redshift = {
                deleteCluster: function(params, callback) {
                    callback(null, 'success')
                }
            };

            return redshiftutilities.deleteCluster('any_params').then((result) => {
                expect(result).to.equal('success');
            });
        });

        it('throws error from redshift delete clusters', () => {
            const redshiftutilities = global.SixCRM.routes.include('lib', 'redshift-utilities.js');

            redshiftutilities.redshift = {
                deleteCluster: function(params, callback) {
                    callback('fail', null)
                }
            };

            return redshiftutilities.deleteCluster('any_params').catch((error) => {
                expect(error).to.equal('fail');
            });
        });
    });

    describe('createCluster', () => {

        it('returns success from redshift create cluster', () => {
            const redshiftutilities = global.SixCRM.routes.include('lib', 'redshift-utilities.js');

            redshiftutilities.redshift = {
                createCluster: function(params, callback) {
                    callback(null, 'success')
                }
            };

            return redshiftutilities.createCluster('any_params').then((result) => {
                expect(result).to.equal('success');
            });
        });

        it('throws error from redshift create cluster', () => {
            const redshiftutilities = global.SixCRM.routes.include('lib', 'redshift-utilities.js');

            redshiftutilities.redshift = {
                createCluster: function(params, callback) {
                    callback('fail', null)
                }
            };

            return redshiftutilities.createCluster('any_params').catch((error) => {
                expect(error).to.equal('fail');
            });
        });
    });

    describe('waitForCluster', () => {

        it('returns success from redshift wait for cluster', () => {
            const redshiftutilities = global.SixCRM.routes.include('lib', 'redshift-utilities.js');

            redshiftutilities.redshift = {
                waitFor: function(state, params, callback) {
                    callback(null, 'success')
                }
            };

            return redshiftutilities.waitForCluster('a_state', 'any_params').then((result) => {
                expect(result).to.equal('success');
            });
        });

        it('throws error from redshift wait for cluster', () => {
            const redshiftutilities = global.SixCRM.routes.include('lib', 'redshift-utilities.js');

            redshiftutilities.redshift = {
                waitFor: function(state, params, callback) {
                    callback('fail', null)
                }
            };

            return redshiftutilities.waitForCluster('a_state', 'any_params').catch((error) => {
                expect(error).to.equal('fail');
            });
        });
    });
});
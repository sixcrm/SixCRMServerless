const chai = require('chai');
const expect = chai.expect;
const objectutilities = require('@6crm/sixcrmcore/lib/util/object-utilities').default;
const AWSTestUtils = require('./aws-test-utils');

describe('controllers/providers/rds-provider', () => {

	describe('construct', () => {

		it('successfully constructs', () => {

			let RDSProvider = global.SixCRM.routes.include('controllers', 'providers/rds-provider.js');
			const rdsprovider = new RDSProvider();

			expect(objectutilities.getClassName(rdsprovider)).to.equal('RDSProvider');

		});

	});

	describe('describeClusters', () => {

		it('successfully describes cluster with cluster identifier', () => {

			let RDSProvider = global.SixCRM.routes.include('controllers', 'providers/rds-provider.js');
			const rdsprovider = new RDSProvider();

			rdsprovider.rds = {
				describeDBClusters:(parameters, callback) => {
					let error = new Error('DBClusterNotFoundFault: DBCluster '+parameters.DBClusterIdentifier+' not found');

					error.statusCode = 404
					callback(error, null);
				}
			};

			let parameters = {
				DBClusterIdentifier:'sixcrm'
			};

			return rdsprovider.describeClusters(parameters).then(result => {
				expect(result).to.have.property('ResponseMetadata');
				expect(result).to.have.property('DBClusters');
			});

		});

		it('successfully describes clusters', () => {

			let RDSProvider = global.SixCRM.routes.include('controllers', 'providers/rds-provider.js');
			const rdsprovider = new RDSProvider();

			rdsprovider.rds = {
				describeDBClusters:(parameters, callback) => {
					callback(null, {ResponseMetadata:{}, DBClusters:[]});
				}
			};

			return rdsprovider.describeClusters({}).then(result => {
				expect(result).to.have.property('ResponseMetadata');
				expect(result).to.have.property('DBClusters');

			});

		});

	});

	describe('describeDBInstances', () => {

		it('throws error when db instance identifier is not found', () => {

			let RDSProvider = global.SixCRM.routes.include('controllers', 'providers/rds-provider.js');
			const rdsprovider = new RDSProvider();

			rdsprovider.rds = {
				describeDBInstances:(parameters, callback) => {
					let error = new Error('DBInstanceNotFoundFault: DBInstance '+parameters.DBInstanceIdentifier+' not found');

					error.statusCode = 404;
					callback(error, null);
				}
			};

			let parameters = {
				DBInstanceIdentifier:'sixcrm'
			};

			return rdsprovider.describeDBInstances(parameters).then(result => {
				expect(result).to.have.property('ResponseMetadata');
				expect(result).to.have.property('DBInstances');
			});

		});

		it('successfully describes db instances', () => {

			let RDSProvider = global.SixCRM.routes.include('controllers', 'providers/rds-provider.js');
			const rdsprovider = new RDSProvider();

			rdsprovider.rds = {
				describeDBInstances:(parameters, callback) => {
					callback(null, {ResponseMetadata:{}, DBInstances:[]});
				}
			};

			return rdsprovider.describeDBInstances({}).then(result => {
				expect(result).to.have.property('ResponseMetadata');
				expect(result).to.have.property('DBInstances');

			});

		});

	});

	describe('createDBInstance', () => {

		it('successfully creates db instance', () => {

			let parameters = {
				DBInstanceClass:'db.r4.large',
				DBInstanceIdentifier: 'sixcrm',
				Engine:'aurora-postgresql'
			};

			let RDSProvider = global.SixCRM.routes.include('controllers', 'providers/rds-provider.js');
			const rdsprovider = new RDSProvider();

			rdsprovider.rds = {
				createDBInstance:(parameters, callback) => {
					callback(null, {ResponseMetadata:{}, DBInstances:[]});
				}
			};

			return rdsprovider.createDBInstance(parameters).then(result => {
				expect(result).to.have.property('ResponseMetadata');
				expect(result).to.have.property('DBInstances');

			});

		});

	});

	describe('putDBInstance', () => {

		it('successfully creates and describes db instance', () => {

			let parameters = {
				DBInstanceClass:'db.r4.large',
				DBInstanceIdentifier: 'sixcrm',
				Engine:'aurora-postgresql'
			};

			let RDSProvider = global.SixCRM.routes.include('controllers', 'providers/rds-provider.js');
			const rdsprovider = new RDSProvider();

			rdsprovider.rds = {
				createDBInstance:(parameters, callback) => {
					callback(null, {ResponseMetadata:{}, DBInstances:[]});
				},
				describeDBInstances:(parameters, callback) => {
					callback(null, {ResponseMetadata:{}, DBInstances:[]});
				}
			};

			return rdsprovider.putDBInstance(parameters).then(result => {
				expect(result).to.have.property('ResponseMetadata');
				expect(result).to.have.property('DBInstances');

			});

		});

		it('successfully puts db instance', () => {

			let parameters = {
				DBInstanceIdentifier: 'sixcrm'
			};

			let RDSProvider = global.SixCRM.routes.include('controllers', 'providers/rds-provider.js');
			const rdsprovider = new RDSProvider();

			rdsprovider.rds = {
				describeDBInstances:(parameters, callback) => {
					callback(null, {ResponseMetadata:{}, DBInstances:[{DBInstanceArn: {}}]});
				}
			};

			return rdsprovider.putDBInstance(parameters).then(result => {
				expect(result).to.have.property('DBInstanceArn');
			});

		});

	});

	describe('createCluster', () => {

		it('successfully creates cluster', () => {

			let parameters = {
				DBClusterIdentifier: 'sixcrm',
				Engine:'aurora-postgresql'
			};

			let RDSProvider = global.SixCRM.routes.include('controllers', 'providers/rds-provider.js');
			const rdsprovider = new RDSProvider();

			rdsprovider.rds = {
				createDBCluster: AWSTestUtils.AWSPromise({ResponseMetadata:{}, DBCluster:[]})
			};

			return rdsprovider.createCluster(parameters).then(result => {
				expect(result).to.have.property('ResponseMetadata');
				expect(result).to.have.property('DBCluster');

			});

		});

	});

	describe('describeClusters', () => {

		it('throws error when db cluster identifier is not found', () => {

			let RDSProvider = global.SixCRM.routes.include('controllers', 'providers/rds-provider.js');
			const rdsprovider = new RDSProvider();

			rdsprovider.rds = {
				describeDBClusters:(parameters, callback) => {
					let error = new Error('DBClusterNotFoundFault: DBCluster '+parameters.DBClusterIdentifier+' not found');

					error.statusCode = 404;
					callback(error, null);
				}
			};

			let parameters = {
				DBClusterIdentifier:'sixcrm'
			};

			return rdsprovider.describeClusters(parameters).then(result => {
				expect(result).to.have.property('ResponseMetadata');
				expect(result).to.have.property('DBClusters');
			});

		});

		it('successfully describes db clusters', () => {

			let RDSProvider = global.SixCRM.routes.include('controllers', 'providers/rds-provider.js');
			const rdsprovider = new RDSProvider();

			rdsprovider.rds = {
				describeDBClusters:(parameters, callback) => {
					callback(null, {ResponseMetadata:{}, DBClusters:[]});
				}
			};

			return rdsprovider.describeClusters({}).then(result => {
				expect(result).to.have.property('ResponseMetadata');
				expect(result).to.have.property('DBClusters');

			});

		});

	});

	describe('putCluster', () => {

		it('successfully creates and describes db cluster', () => {

			let parameters = {
				DBClusterIdentifier: 'sixcrm',
				Engine:'aurora-postgresql'
			};

			let RDSProvider = global.SixCRM.routes.include('controllers', 'providers/rds-provider.js');
			const rdsprovider = new RDSProvider();

			rdsprovider.rds = {
				createDBCluster: AWSTestUtils.AWSPromise({ResponseMetadata:{}, DBCluster:[]}),
				describeDBClusters:(parameters, callback) => {
					callback(null, {ResponseMetadata:{}, DBClusters:[]});
				}
			};

			return rdsprovider.putCluster(parameters).then(result => {
				expect(result).to.have.property('ResponseMetadata');
				expect(result).to.have.property('DBCluster');

			});

		});

		it('successfully puts db cluster', () => {

			let parameters = {
				DBClusterIdentifier: 'sixcrm'
			};

			let RDSProvider = global.SixCRM.routes.include('controllers', 'providers/rds-provider.js');
			const rdsprovider = new RDSProvider();

			rdsprovider.rds = {
				describeDBClusters:(parameters, callback) => {
					callback(null, {ResponseMetadata:{}, DBClusters:[{}]});
				}
			};

			return rdsprovider.putCluster(parameters).then(result => {
				expect(result).to.have.property('DBClusters');
			});

		});

	});

});

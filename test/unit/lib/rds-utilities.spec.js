'use strict'

const chai = require('chai');
const expect = chai.expect;
const objectutilities = global.SixCRM.routes.include('lib','object-utilities.js');

describe('lib/rds-utilities', () => {

  describe('construct', () => {

    it('successfully constructs', () => {

      let rdsutilities = global.SixCRM.routes.include('lib', 'rds-utilities.js');

      expect(objectutilities.getClassName(rdsutilities)).to.equal('RDSUtilities');

    });

  });

  describe('describeClusters', () => {

    it('successfully describes cluster with cluster identifier', () => {


      let rdsutilities = global.SixCRM.routes.include('lib', 'rds-utilities.js');

      rdsutilities.rds = {
        describeDBClusters:(parameters, callback) => {
          let error = new Error('DBClusterNotFoundFault: DBCluster '+parameters.DBClusterIdentifier+' not found');

          error.statusCode = 404
          callback(error, null);
        }
      };

      let parameters = {
        DBClusterIdentifier:'sixcrm'
      };

      return rdsutilities.describeClusters(parameters).then(result => {
        expect(result).to.have.property('ResponseMetadata');
        expect(result).to.have.property('DBClusters');
      });

    });

    it('successfully describes clusters', () => {

      let rdsutilities = global.SixCRM.routes.include('lib', 'rds-utilities.js');

      rdsutilities.rds = {
        describeDBClusters:(parameters, callback) => {
          callback(null, {ResponseMetadata:{}, DBClusters:[]});
        }
      };

      return rdsutilities.describeClusters({}).then(result => {
        expect(result).to.have.property('ResponseMetadata');
        expect(result).to.have.property('DBClusters');

      });

    });

  });

  describe('describeDBInstances', () => {

    it('throws error when db instance identifier is not found', () => {

      let rdsutilities = global.SixCRM.routes.include('lib', 'rds-utilities.js');

      rdsutilities.rds = {
        describeDBInstances:(parameters, callback) => {
          let error = new Error('DBInstanceNotFoundFault: DBInstance '+parameters.DBInstanceIdentifier+' not found');

          error.statusCode = 404;
          callback(error, null);
        }
      };

      let parameters = {
          DBInstanceIdentifier:'sixcrm'
      };

      return rdsutilities.describeDBInstances(parameters).then(result => {
        expect(result).to.have.property('ResponseMetadata');
        expect(result).to.have.property('DBInstances');
      });

    });

    it('successfully describes db instances', () => {

      let rdsutilities = global.SixCRM.routes.include('lib', 'rds-utilities.js');

      rdsutilities.rds = {
        describeDBInstances:(parameters, callback) => {
          callback(null, {ResponseMetadata:{}, DBInstances:[]});
        }
      };

      return rdsutilities.describeDBInstances({}).then(result => {
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

      let rdsutilities = global.SixCRM.routes.include('lib', 'rds-utilities.js');

      rdsutilities.rds = {
        createDBInstance:(parameters, callback) => {
          callback(null, {ResponseMetadata:{}, DBInstances:[]});
        }
      };

      return rdsutilities.createDBInstance(parameters).then(result => {
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

      let rdsutilities = global.SixCRM.routes.include('lib', 'rds-utilities.js');

      rdsutilities.rds = {
        createDBInstance:(parameters, callback) => {
            callback(null, {ResponseMetadata:{}, DBInstances:[]});
        },
        describeDBInstances:(parameters, callback) => {
            callback(null, {ResponseMetadata:{}, DBInstances:[]});
        }
      };

      return rdsutilities.putDBInstance(parameters).then(result => {
        expect(result).to.have.property('ResponseMetadata');
        expect(result).to.have.property('DBInstances');

      });

    });

    it('successfully puts db instance', () => {

      let parameters = {
          DBInstanceIdentifier: 'sixcrm'
      };

      let rdsutilities = global.SixCRM.routes.include('lib', 'rds-utilities.js');

      rdsutilities.rds = {
        describeDBInstances:(parameters, callback) => {
            callback(null, {ResponseMetadata:{}, DBInstances:[{DBInstanceArn: {}}]});
        }
      };

      return rdsutilities.putDBInstance(parameters).then(result => {
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

          let rdsutilities = global.SixCRM.routes.include('lib', 'rds-utilities.js');

          rdsutilities.rds = {
              createDBCluster:(parameters, callback) => {
                  callback(null, {ResponseMetadata:{}, DBCluster:[]});
              }
          };

          return rdsutilities.createCluster(parameters).then(result => {
              expect(result).to.have.property('ResponseMetadata');
              expect(result).to.have.property('DBCluster');

          });

      });

  });

  describe('describeClusters', () => {

      it('throws error when db cluster identifier is not found', () => {

          let rdsutilities = global.SixCRM.routes.include('lib', 'rds-utilities.js');

          rdsutilities.rds = {
              describeDBClusters:(parameters, callback) => {
                  let error = new Error('DBClusterNotFoundFault: DBCluster '+parameters.DBClusterIdentifier+' not found');

                  error.statusCode = 404;
                  callback(error, null);
              }
          };

          let parameters = {
              DBClusterIdentifier:'sixcrm'
          };

          return rdsutilities.describeClusters(parameters).then(result => {
              expect(result).to.have.property('ResponseMetadata');
              expect(result).to.have.property('DBClusters');
          });

      });

      it('successfully describes db clusters', () => {

          let rdsutilities = global.SixCRM.routes.include('lib', 'rds-utilities.js');

          rdsutilities.rds = {
              describeDBClusters:(parameters, callback) => {
                  callback(null, {ResponseMetadata:{}, DBClusters:[]});
              }
          };

          return rdsutilities.describeClusters({}).then(result => {
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

            let rdsutilities = global.SixCRM.routes.include('lib', 'rds-utilities.js');

            rdsutilities.rds = {
                createDBCluster:(parameters, callback) => {
                    callback(null, {ResponseMetadata:{}, DBCluster:[]});
                },
                describeDBClusters:(parameters, callback) => {
                    callback(null, {ResponseMetadata:{}, DBClusters:[]});
                }
            };

            return rdsutilities.putCluster(parameters).then(result => {
                expect(result).to.have.property('ResponseMetadata');
                expect(result).to.have.property('DBCluster');

            });

        });

        it('successfully puts db cluster', () => {

            let parameters = {
                DBClusterIdentifier: 'sixcrm'
            };

            let rdsutilities = global.SixCRM.routes.include('lib', 'rds-utilities.js');

            rdsutilities.rds = {
                describeDBClusters:(parameters, callback) => {
                    callback(null, {ResponseMetadata:{}, DBClusters:[{}]});
                }
            };

            return rdsutilities.putCluster(parameters).then(result => {
                expect(result).to.have.property('DBClusters');
            });

        });

    });

});
